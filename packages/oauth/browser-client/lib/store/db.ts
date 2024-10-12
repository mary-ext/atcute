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
}

interface Schema {
	sessions: {
		key: At.DID;
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

			window.addEventListener('storage', listener, { signal });
		}

		locks.request(`${storageKey}:cleanup`, { ifAvailable: true }, async (lock) => {
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
		});

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
			set(key, value) {
				read();

				const item: SchemaItem<Schema[N]['value']> = {
					expiresAt: expiresAt(value),
					value: value,
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
		states: createStore('states', (_item) => Date.now() + 10 * 60 * 1_000),
		dpopNonces: createStore('dpopNonces', (_item) => Date.now() + 10 * 60 * 1_000),
	};
};
