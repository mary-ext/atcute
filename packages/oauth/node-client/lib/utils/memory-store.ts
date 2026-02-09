import { LRUCache } from './lru.ts';
import type { Store } from './store.ts';

export interface MemoryStoreOptions {
	/** maximum number of items the store can hold */
	maxSize?: number;
	/** time-to-live in milliseconds */
	ttl?: number;
	/** whether to automatically purge expired entries */
	ttlAutopurge?: boolean;
}

interface Entry<V> {
	value: V;
	expiresAt: number;
}

/**
 * in-memory store with optional LRU eviction and TTL expiration.
 *
 * suitable for development, testing, or single-instance deployments.
 * for production with multiple instances, use a shared store (e.g., Redis).
 */
export class MemoryStore<K, V> implements Store<K, V>, Disposable {
	#map: LRUCache<K, Entry<V>> | Map<K, Entry<V>>;

	#ttlMs: number;
	#ttlAutopurge: boolean;
	#ttlTimer: ReturnType<typeof setTimeout> | undefined;

	/**
	 * creates a new in-memory store.
	 *
	 * @param options store configuration
	 */
	constructor(options: MemoryStoreOptions = {}) {
		this.#map = options.maxSize !== undefined ? new LRUCache(options.maxSize) : new Map();

		this.#ttlMs = options.ttl ?? 0;
		this.#ttlAutopurge = options.ttlAutopurge ?? false;
	}

	/** @inheritdoc */
	get(key: K): V | undefined {
		const entry = this.#map.get(key);
		if (entry === undefined) {
			return undefined;
		}

		if (this.#ttlMs > 0 && Date.now() > entry.expiresAt) {
			this.#map.delete(key);
			return undefined;
		}

		return entry.value;
	}

	/** @inheritdoc */
	set(key: K, value: V): void {
		this.#map.set(key, {
			value,
			expiresAt: Date.now() + this.#ttlMs,
		});

		if (this.#ttlAutopurge && this.#ttlTimer === undefined) {
			this.#ttlTimer = setTimeout(() => this.#evict(), this.#ttlMs);
		}
	}

	/** @inheritdoc */
	delete(key: K): void {
		this.#map.delete(key);
	}

	/** @inheritdoc */
	clear(): void {
		this.#map.clear();
	}

	/**
	 * stops background timers and releases resources.
	 */
	dispose(): void {
		if (this.#ttlTimer !== undefined) {
			clearTimeout(this.#ttlTimer);
			this.#ttlTimer = undefined;
		}
	}

	[Symbol.dispose](): void {
		this.dispose();
	}

	#evict(): void {
		this.#ttlTimer = undefined;

		const now = Date.now();
		let earliest = Infinity;

		for (const [key, { expiresAt }] of this.#map) {
			if (now > expiresAt) {
				this.#map.delete(key);
			} else if (expiresAt < earliest) {
				earliest = expiresAt;
			}
		}

		if (earliest < Infinity) {
			this.#ttlTimer = setTimeout(() => this.#evict(), earliest - now);
		}
	}
}
