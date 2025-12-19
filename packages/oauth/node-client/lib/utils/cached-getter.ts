import type { Awaitable } from '../types/misc.js';
import type { GetOptions, Store } from './store.js';

export interface GetCachedOptions {
	signal?: AbortSignal;
	noCache?: boolean;
	allowStale?: boolean;
}

export interface GetterOptions {
	signal?: AbortSignal;
	noCache: boolean;
}

export type Getter<K, V> = (key: K, options: GetterOptions, storedValue: V | undefined) => Awaitable<V>;

export interface CachedGetterOptions<K, V> {
	isStale?(key: K, value: V): Awaitable<boolean>;
	onStoreError?(err: unknown, key: K, value: V): Awaitable<void>;
	deleteOnError?(err: unknown, key: K, value: V): Awaitable<boolean>;
}

type PendingItem<V> = Promise<{ value: V; fresh: boolean }>;

const returnTrue = () => true;
const returnFalse = () => false;

export class CachedGetter<K, V> {
	#pending = new Map<K, PendingItem<V>>();

	constructor(
		readonly getter: Getter<K, V>,
		readonly store: Store<K, V>,
		readonly options: CachedGetterOptions<K, V> = {},
	) {}

	async get(key: K, options: GetCachedOptions = {}): Promise<V> {
		const { signal, allowStale = false, noCache = false } = options;
		const { isStale, deleteOnError } = this.options;

		signal?.throwIfAborted();

		const allowStored: (value: V) => Awaitable<boolean> = noCache
			? returnFalse
			: allowStale || isStale == null
				? returnTrue
				: async (value: V) => !(await isStale(key, value));

		let promise: PendingItem<V> | undefined;

		// wait for the previous request for the same key to finish
		while ((promise = this.#pending.get(key)) !== undefined) {
			try {
				const { value, fresh } = await promise;

				if (fresh) {
					return value;
				}

				if (await allowStored(value)) {
					return value;
				}
			} catch {
				// ignore errors from previous requests
			}

			signal?.throwIfAborted();
		}

		// now we start our own.
		promise = (async (): PendingItem<V> => {
			try {
				const storedValue = await this.getStored(key, { signal });

				if (storedValue !== undefined && (await allowStored(storedValue))) {
					return { fresh: false, value: storedValue };
				}

				let value: V;
				try {
					const options: GetterOptions = { signal, noCache };

					value = await (0, this.getter)(key, options, storedValue);
				} catch (err) {
					if (storedValue !== undefined && deleteOnError !== undefined) {
						try {
							if (await deleteOnError(err, key, storedValue)) {
								await this.deleteStored(key, err);
							}
						} catch (error) {
							throw new AggregateError([err, error], `error while deleting stored value`);
						}
					}

					throw err;
				}

				await this.setStored(key, value);
				return { fresh: true, value: value };
			} finally {
				this.#pending.delete(key);
			}
		})();

		this.#pending.set(key, promise);

		const { value } = await promise;
		return value;
	}

	async getStored(key: K, options?: GetOptions): Promise<V | undefined> {
		try {
			return await this.store.get(key, options);
		} catch {
			return undefined;
		}
	}

	async setStored(key: K, value: V): Promise<void> {
		try {
			await this.store.set(key, value);
		} catch (err) {
			const onStoreError = this.options?.onStoreError;
			await onStoreError?.(err, key, value);
		}
	}

	async deleteStored(key: K, _cause?: unknown): Promise<void> {
		await this.store.delete(key);
	}
}
