interface LRUNode<K, V> {
	key: K;
	value: V;
	prev: LRUNode<K, V> | null;
	next: LRUNode<K, V> | null;
}

/**
 * a least recently used (LRU) cache with fixed capacity
 * evicts the least recently used items when capacity is exceeded
 */
class LRUCache<K, V> {
	readonly #size: number;
	#count = 0;

	#map = new Map<K, LRUNode<K, V>>();
	#head: LRUNode<K, V> | null = null;
	#tail: LRUNode<K, V> | null = null;

	/**
	 * creates a new LRU cache with the specified capacity
	 * @param size the maximum number of items the cache can hold
	 */
	constructor(size: number) {
		this.#size = size;
	}

	/** the maximum capacity of the cache */
	get size(): number {
		return this.#size;
	}

	/**
	 * gets a value without affecting its position in the cache
	 * @param key the key to look up
	 * @returns the value associated with the key, or undefined if not found
	 */
	peek(key: K): V | undefined {
		const node = this.#map.get(key);
		if (node === undefined) {
			return undefined;
		}

		return node.value;
	}

	/**
	 * gets a value and marks it as most recently used
	 * @param key the key to look up
	 * @returns the value associated with the key, or undefined if not found
	 */
	get(key: K): V | undefined {
		const node = this.#map.get(key);
		if (node === undefined) {
			return undefined;
		}

		this.#moveToFront(node);
		return node.value;
	}

	/**
	 * stores a value for the given key, marking it as most recently used
	 * evicts the least recently used item if the cache is at capacity
	 * @param key the key to store
	 * @param value the value to associate with the key
	 */
	put(key: K, value: V): void {
		{
			const existing = this.#map.get(key);

			if (existing !== undefined) {
				existing.value = value;
				this.#moveToFront(existing);
				return;
			}
		}

		{
			const node: LRUNode<K, V> = { key, value, prev: null, next: null };
			this.#map.set(key, node);
			this.#addToFront(node);

			this.#count++;
		}

		this.#evict();
	}

	/**
	 * removes a key from the cache
	 * @param key the key to remove
	 * @returns true if the key was found and removed, false otherwise
	 */
	delete(key: K): boolean {
		const node = this.#map.get(key);
		if (node === undefined) {
			return false;
		}

		this.#map.delete(key);
		this.#removeNode(node);
		this.#count--;
		return true;
	}

	/**
	 * removes all items from the cache
	 */
	clear(): void {
		this.#map.clear();
		this.#head = null;
		this.#tail = null;
		this.#count = 0;
	}

	/**
	 * checks if a key exists in the cache
	 * @param key the key to check
	 * @returns true if the key exists, false otherwise
	 */
	has(key: K): boolean {
		return this.#map.has(key);
	}

	/**
	 * iterates over the keys in LRU order (most to least recently used)
	 * @returns iterator of keys
	 */
	*keys(): IterableIterator<K> {
		let current = this.#head;
		while (current !== null) {
			yield current.key;
			current = current.next;
		}
	}

	/**
	 * iterates over the values in LRU order (most to least recently used)
	 * @returns iterator of values
	 */
	*values(): IterableIterator<V> {
		let current = this.#head;
		while (current !== null) {
			yield current.value;
			current = current.next;
		}
	}

	/**
	 * iterates over the key-value pairs in LRU order (most to least recently used)
	 * @returns iterator of [key, value] tuples
	 */
	*entries(): IterableIterator<[K, V]> {
		let current = this.#head;
		while (current !== null) {
			yield [current.key, current.value];
			current = current.next;
		}
	}

	#moveToFront(node: LRUNode<K, V>): void {
		if (this.#head === node) {
			return;
		}

		if (node.prev !== null) {
			node.prev.next = node.next;
		}

		if (node.next !== null) {
			node.next.prev = node.prev;
		} else {
			this.#tail = node.prev;
		}

		node.prev = null;
		node.next = this.#head;

		// Safe because this method is only called when head exists
		this.#head!.prev = node;
		this.#head = node;
	}

	#addToFront(node: LRUNode<K, V>): void {
		node.next = this.#head;
		node.prev = null;

		if (this.#head !== null) {
			this.#head.prev = node;
		} else {
			this.#tail = node;
		}

		this.#head = node;
	}

	#removeNode(node: LRUNode<K, V>): void {
		if (node.prev !== null) {
			node.prev.next = node.next;
		} else {
			this.#head = node.next;
		}

		if (node.next !== null) {
			node.next.prev = node.prev;
		} else {
			this.#tail = node.prev;
		}
	}

	#evict(): void {
		const excess = this.#count - this.#size;
		if (excess <= 0) {
			return;
		}

		let current: LRUNode<K, V> = this.#tail!;

		for (let i = 0; i < excess; i++) {
			this.#map.delete(current.key);
			current = current.prev!;
		}

		current.next = null;
		this.#tail = current;

		this.#count -= excess;
	}
}

export default LRUCache;
