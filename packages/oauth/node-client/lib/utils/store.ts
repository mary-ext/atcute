import type { Awaitable } from '../types/misc.js';

/** options for store get operations */
export interface GetOptions {
	/** abort signal for cancellation */
	signal?: AbortSignal;
}

/**
 * key-value store interface for sessions, states, and caches.
 *
 * implementations can be synchronous or asynchronous.
 */
export interface Store<K, V> {
	/**
	 * gets a value by key.
	 *
	 * @param key lookup key
	 * @param options get options (e.g., abort signal)
	 * @returns value if found, undefined otherwise
	 */
	get(key: K, options?: GetOptions): Awaitable<V | undefined>;

	/**
	 * sets a value for the given key.
	 *
	 * @param key storage key
	 * @param value value to store
	 */
	set(key: K, value: V): Awaitable<void>;

	/**
	 * deletes a value by key.
	 *
	 * @param key key to delete
	 */
	delete(key: K): Awaitable<void>;

	/**
	 * clears all entries from the store.
	 */
	clear(): Awaitable<void>;
}
