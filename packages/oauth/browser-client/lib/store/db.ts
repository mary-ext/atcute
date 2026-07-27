import type { Did } from '@atcute/lexicons';
import type { DpopPrivateJwk } from '@atcute/oauth-crypto';
import type { OAuthAuthorizationServerMetadata } from '@atcute/oauth-types';

import type { SimpleStore } from '../types/store.ts';
import type { Session } from '../types/token.ts';
import { getLockManager } from '../utils/runtime.ts';

export interface OAuthDatabaseOptions {
	name: string;
}

interface Envelope<T> {
	value: T;
	expiresAt: number | null;
	updatedAt?: number;
	revision: number;
}

/** freshest envelope known for a key, from our own writes or another document's broadcast */
interface Observed<T> {
	envelope: Envelope<T>;
	revision: number;
	/** set when our own write never reached storage */
	unpersisted?: boolean;
}

interface BroadcastMessage {
	store: string;
	key: string;
	envelope: Envelope<unknown> | null;
	revision: number;
}

interface Schema {
	sessions: {
		key: Did;
		value: Session;
		indexes: {
			expiresAt: number;
		};
	};
	states: {
		key: string;
		value: {
			dpopKey: DpopPrivateJwk;
			metadata: OAuthAuthorizationServerMetadata;
			verifier?: string;
			state?: unknown;
		};
	};

	dpopNonces: {
		key: string;
		value: string;
	};
}

/** layout version, guards the one-time migration off the single-blob format */
const SCHEMA_VERSION = '2';

/** how long the startup pass waits before reclaiming expired records */
const CLEANUP_DELAY = 10_000;

const isExpired = (envelope: Envelope<unknown>, now: number): boolean => {
	return envelope.expiresAt !== null && now > envelope.expiresAt;
};

export type OAuthDatabase = ReturnType<typeof createOAuthDatabase>;

export const createOAuthDatabase = ({ name }: OAuthDatabaseOptions) => {
	const controller = new AbortController();
	const signal = controller.signal;

	const channel = new BroadcastChannel(`${name}:sync`);
	signal.addEventListener('abort', () => channel.close());

	const versionKey = `${name}:version`;

	let migrated: boolean;
	try {
		migrated = localStorage.getItem(versionKey) === SCHEMA_VERSION;
	} catch {
		migrated = true;
	}

	const createStore = <N extends keyof Schema>(
		subname: N,
		computeExpiry: (item: Schema[N]['value']) => null | number,
		persistUpdatedAt = false,
	): SimpleStore<Schema[N]['key'], Schema[N]['value']> => {
		type K = Schema[N]['key'];
		type V = Schema[N]['value'];

		const prefix = `${name}:${subname}:`;
		const legacyKey = `${name}:${subname}`;

		const observed = new Map<string, Observed<V>>();
		const watchers = new Set<(key: K) => void>();

		/** highest revision this document has issued, see `set` */
		let lastRevision = 0;

		const notify = (key: string) => {
			for (const watcher of watchers) {
				watcher(key as K);
			}
		};

		const assertOpen = () => {
			if (signal.aborted) {
				throw new Error(`store closed`);
			}
		};

		const readStored = (key: string): Envelope<V> | undefined => {
			let raw: string | null;
			try {
				raw = localStorage.getItem(prefix + key);
			} catch {
				return;
			}

			if (raw === null) {
				return;
			}

			try {
				const parsed = JSON.parse(raw);
				if (parsed === null || typeof parsed !== 'object') {
					return;
				}

				return { ...parsed, revision: parsed.revision ?? 0 };
			} catch {
				return;
			}
		};

		// a renderer can serve a localStorage value older than another document just
		// wrote, so an out-of-band observation wins whenever it is newer
		const readEnvelope = (key: string): Envelope<V> | undefined => {
			assertOpen();

			const stored = readStored(key);
			const entry = observed.get(key);

			if (entry === undefined) {
				return stored;
			}

			if (stored === undefined) {
				// deletions drop the entry, so an absent record means our storage view
				// lags the write the entry came from
				return entry.envelope;
			}

			return entry.revision > stored.revision ? entry.envelope : stored;
		};

		const publish = (key: string, envelope: Envelope<V> | null, revision: number) => {
			try {
				// oxlint-disable-next-line unicorn/require-post-message-target-origin
				channel.postMessage({ store: subname, key, envelope, revision } satisfies BroadcastMessage);
			} catch {
				// ignore, storage events still carry the update
			}
		};

		const ingest = (key: string, envelope: Envelope<V> | null, revision: number) => {
			if (envelope === null) {
				// storage is authoritative for absence, a tombstone here would shadow a
				// later write for the same key
				observed.delete(key);
				notify(key);
				return;
			}

			const current = observed.get(key);
			// an equal revision carries nothing new, and displacing what we hold could
			// drop an unpersisted write, the only copy of its value
			if (current !== undefined && current.revision >= revision) {
				return;
			}

			observed.set(key, { envelope, revision });
			notify(key);
		};

		channel.addEventListener(
			'message',
			(ev: MessageEvent<BroadcastMessage>) => {
				const data = ev.data;
				if (data !== null && typeof data === 'object' && data.store === subname) {
					ingest(data.key, data.envelope as Envelope<V> | null, data.revision);
				}
			},
			{ signal },
		);

		globalThis.addEventListener(
			'storage',
			(ev: StorageEvent) => {
				if (ev.key === null || !ev.key.startsWith(prefix)) {
					return;
				}

				const key = ev.key.slice(prefix.length);

				if (ev.newValue === null) {
					ingest(key, null, 0);
					return;
				}

				try {
					const parsed = JSON.parse(ev.newValue);
					if (parsed !== null && typeof parsed === 'object') {
						ingest(key, parsed, parsed.revision ?? 0);
					}
				} catch {
					// ignore malformed updates
				}
			},
			{ signal },
		);

		const scanStorageKeys = (): string[] => {
			const keys: string[] = [];

			try {
				for (let idx = 0, len = localStorage.length; idx < len; idx++) {
					const storageKey = localStorage.key(idx);
					if (storageKey !== null && storageKey.startsWith(prefix)) {
						keys.push(storageKey.slice(prefix.length));
					}
				}
			} catch {
				// ignore read errors
			}

			return keys;
		};

		if (!migrated) {
			migrateLegacyStore(legacyKey, prefix);
		}

		{
			const cleanup = async (lock: Lock | null) => {
				if (!lock || signal.aborted) {
					return;
				}

				await new Promise((resolve) => setTimeout(resolve, CLEANUP_DELAY));
				if (signal.aborted) {
					return;
				}

				const now = Date.now();

				for (const key of scanStorageKeys()) {
					// re-read before removing, the scan is a snapshot and another document
					// may have replaced the record since
					const envelope = readStored(key);
					if (envelope === undefined || !isExpired(envelope, now)) {
						continue;
					}

					try {
						localStorage.removeItem(prefix + key);
					} catch {
						// ignore write errors
					}
				}
			};

			getLockManager().request(`${prefix}cleanup`, { ifAvailable: true }, cleanup);
		}

		return {
			get(key) {
				const envelope = readEnvelope(key);
				// expired records are only filtered out here, reclaiming them is the
				// cleanup pass' job
				if (envelope === undefined || isExpired(envelope, Date.now())) {
					return;
				}

				return envelope.value;
			},
			getRecord(key) {
				const envelope = readEnvelope(key);
				if (envelope === undefined || isExpired(envelope, Date.now())) {
					return;
				}

				return { value: envelope.value, revision: envelope.revision };
			},
			getWithLapsed(key) {
				const envelope = readEnvelope(key);
				const now = Date.now();

				if (envelope === undefined || isExpired(envelope, now)) {
					return [undefined, Infinity];
				}

				const updatedAt = envelope.updatedAt;
				if (updatedAt === undefined) {
					return [envelope.value, Infinity];
				}

				return [envelope.value, now - updatedAt];
			},
			set(key, value) {
				const previous = readEnvelope(key);

				// revisions have to keep climbing across a delete and re-create, otherwise
				// a document still holding the higher one reads this write as stale; the
				// counter covers writes in this document, the clock covers them across
				const revision = Math.max((previous?.revision ?? 0) + 1, lastRevision + 1, Date.now());
				lastRevision = revision;

				const envelope: Envelope<V> = {
					value: value,
					expiresAt: computeExpiry(value),
					updatedAt: persistUpdatedAt ? Date.now() : undefined,
					revision: revision,
				};

				try {
					localStorage.setItem(prefix + key, JSON.stringify(envelope));
				} catch (err) {
					// kept in memory so the caller does not lose the write, but not broadcast,
					// no other document could read it back
					observed.set(key, { envelope, revision: envelope.revision, unpersisted: true });
					notify(key);

					throw err;
				}

				observed.set(key, { envelope, revision: envelope.revision });
				notify(key);
				publish(key, envelope, envelope.revision);

				return envelope.revision;
			},
			delete(key) {
				assertOpen();

				try {
					localStorage.removeItem(prefix + key);
				} catch {
					// ignore write errors
				}

				observed.delete(key);
				notify(key);
				publish(key, null, 0);
			},
			keys() {
				assertOpen();

				const now = Date.now();
				const found = new Set(scanStorageKeys());

				for (const [key, entry] of observed) {
					if (entry.unpersisted) {
						found.add(key);
					}
				}

				const keys: string[] = [];
				for (const key of found) {
					const envelope = readEnvelope(key);
					if (envelope !== undefined && !isExpired(envelope, now)) {
						keys.push(key);
					}
				}

				return keys as K[];
			},
			watch(listener) {
				watchers.add(listener);

				return () => {
					watchers.delete(listener);
				};
			},
		};
	};

	const database = {
		dispose: () => {
			controller.abort();
		},

		sessions: createStore('sessions', ({ token }) => {
			if (token.refresh) {
				return null;
			}

			return token.expires_at ?? null;
		}),
		states: createStore('states', (_item) => Date.now() + 10 * 60 * 1_000), // 10 minutes

		// The reference PDS have nonces that expire after 3 minutes, while other
		// implementations can have varying expiration times.
		// Stored for 24 hours.
		dpopNonces: createStore('dpopNonces', (_item) => Date.now() + 24 * 60 * 60 * 1_000, true),
		inflightDpop: new Map<string, PromiseWithResolvers<void>>(),
	};

	if (!migrated) {
		try {
			localStorage.setItem(versionKey, SCHEMA_VERSION);
		} catch {
			// ignore, the migration is idempotent and just runs again
		}
	}

	return database;
};

/**
 * copies a legacy single-blob store into per-record keys, without overwriting records already present in the
 * new layout. the blob itself is left behind for documents still reading it.
 */
const migrateLegacyStore = (legacyKey: string, prefix: string) => {
	let raw: string | null;
	try {
		raw = localStorage.getItem(legacyKey);
	} catch {
		return;
	}

	if (raw === null) {
		return;
	}

	let parsed: Record<string, { value: unknown; expiresAt?: number | null; updatedAt?: number }>;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return;
	}

	if (parsed === null || typeof parsed !== 'object') {
		return;
	}

	for (const key in parsed) {
		const item = parsed[key];
		if (item === null || typeof item !== 'object') {
			continue;
		}

		const storageKey = prefix + key;

		try {
			if (localStorage.getItem(storageKey) !== null) {
				continue;
			}

			const envelope: Envelope<unknown> = {
				value: item.value,
				expiresAt: item.expiresAt ?? null,
				updatedAt: item.updatedAt,
				revision: 1,
			};

			localStorage.setItem(storageKey, JSON.stringify(envelope));
		} catch {
			return;
		}
	}
};
