import type { At } from '@atcute/client/lexicons';

import type { DPoPKey } from '../types/dpop.js';
import type { AuthorizationServerMetadata } from '../types/server.js';
import type { SimpleStore } from '../types/store.js';
import type { Session } from '../types/token.js';
import { locks } from '../utils/runtime.js';

export interface OAuthDatabaseOptions {
	name: string;
}

interface SchemaItem<T> {
	value: T;
	expiresAt: number | null;
	updatedAt?: number;
}

interface Schema {
	sessions: {
		key: At.Did;
		value: Session;
		indexes: {
			expiresAt: number;
		};
	};
	states: {
		key: string;
		value: {
			dpopKey: DPoPKey;
			metadata: AuthorizationServerMetadata;
			verifier?: string;
		};
	};

	dpopNonces: {
		key: string;
		value: string;
	};
}

const parse = (raw: string | null) => {
	if (raw != null) {
		const parsed = JSON.parse(raw);
		if (parsed != null) {
			return parsed;
		}
	}

	return {};
};

export type OAuthDatabase = ReturnType<typeof createOAuthDatabase>;

export const createOAuthDatabase = ({ name }: OAuthDatabaseOptions) => {
	const controller = new AbortController();
	const signal = controller.signal;

	const createStore = <N extends keyof Schema>(
		subname: N,
		expiresAt: (item: Schema[N]['value']) => null | number,
		persistUpdatedAt = false,
	): SimpleStore<Schema[N]['key'], Schema[N]['value']> => {
		let store: any;

		const storageKey = `${name}:${subname}`;

		const persist = () => store && localStorage.setItem(storageKey, JSON.stringify(store));
		const read = () => {
			if (signal.aborted) {
				throw new Error(`store closed`);
			}

			return (store ??= parse(localStorage.getItem(storageKey)));
		};

		{
			const listener = (ev: StorageEvent) => {
				if (ev.key === storageKey) {
					store = undefined;
				}
			};

			globalThis.addEventListener('storage', listener, { signal });
		}

		{
			const cleanup = async (lock: Lock | true | null) => {
				if (!lock || signal.aborted) {
					return;
				}

				await new Promise((resolve) => setTimeout(resolve, 10_000));
				if (signal.aborted) {
					return;
				}

				let now = Date.now();
				let changed = false;

				read();

				for (const key in store) {
					const item = store[key];
					const expiresAt = item.expiresAt;

					if (expiresAt !== null && now > expiresAt) {
						changed = true;
						delete store[key];
					}
				}

				if (changed) {
					persist();
				}
			};

			if (locks) {
				locks.request(`${storageKey}:cleanup`, { ifAvailable: true }, cleanup);
			} else {
				cleanup(true);
			}
		}

		return {
			get(key) {
				read();

				const item: SchemaItem<Schema[N]['value']> = store[key];
				if (!item) {
					return;
				}

				const expiresAt = item.expiresAt;
				if (expiresAt !== null && Date.now() > expiresAt) {
					delete store[key];
					persist();

					return;
				}

				return item.value;
			},
			getWithLapsed(key) {
				read();

				const item: SchemaItem<Schema[N]['value']> = store[key];
				const now = Date.now();
				if (!item) {
					return [undefined, Infinity];
				}

				const updatedAt = item.updatedAt;
				if (updatedAt === undefined) {
					return [item.value, Infinity];
				}

				return [item.value, now - updatedAt];
			},
			set(key, value) {
				read();

				const item: SchemaItem<Schema[N]['value']> = {
					value: value,
					expiresAt: expiresAt(value),
					updatedAt: persistUpdatedAt ? Date.now() : undefined,
				};

				store[key] = item;
				persist();
			},
			delete(key) {
				read();

				if (store[key] !== undefined) {
					delete store[key];
					persist();
				}
			},
			keys() {
				read();

				return Object.keys(store);
			},
		};
	};

	return {
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
};
