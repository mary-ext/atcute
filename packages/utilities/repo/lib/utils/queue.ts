interface Node<T> {
	value: T;
	next: Node<T> | undefined;
}

const createNode = <T>(value: T, next: Node<T> | undefined): Node<T> => {
	return { value, next };
};

/** a queue data structure (fifo) */
class Queue<T> implements Iterable<T> {
	#head: Node<T> | undefined;
	#tail: Node<T> | undefined;
	#size: number = 0;

	/** size of the queue */
	get size(): number {
		return this.#size;
	}

	/** clear the queue */
	clear(): void {
		this.#head = undefined;
		this.#tail = undefined;
		this.#size = 0;
	}

	/**
	 * adds a value to the end of the queue
	 *
	 * @param value value to add
	 * @returns the queue instance
	 */
	enqueue(value: T): this {
		const tail = this.#tail;
		const node = createNode(value, undefined);

		if (tail !== undefined) {
			tail.next = node;
		} else {
			this.#head = node;
		}

		this.#tail = node;
		this.#size++;
		return this;
	}

	/**
	 * adds a value to the front of the queue
	 *
	 * @param value value to add
	 * @returns the queue instance
	 */
	enqueueFront(value: T): this {
		const head = this.#head;
		const node = createNode(value, head);

		if (head === undefined) {
			this.#tail = node;
		}

		this.#head = node;
		this.#size++;
		return this;
	}

	/**
	 * removes the first value from the queue
	 *
	 * @returns first queued value, or undefined if empty
	 */
	dequeue(): T | undefined {
		const head = this.#head;
		if (!head) {
			return;
		}

		const next = head.next;

		this.#head = next;
		if (next === undefined) {
			this.#tail = undefined;
		}

		this.#size--;
		return head.value;
	}

	/**
	 * get the first value without removing from queue
	 *
	 * @returns first queued value, or undefined if empty
	 */
	peek(): T | undefined {
		return this.#head?.value;
	}

	/** returns an iterator that drains all values from the queue */
	drain(): IterableIterator<T, undefined, undefined> {
		// oxlint-disable-next-line no-this-alias
		const self = this;

		return {
			next() {
				const head = self.#head;
				if (!head) {
					return { done: true, value: undefined };
				}

				const next = head.next;

				self.#head = next;
				if (next === undefined) {
					self.#tail = undefined;
				}

				self.#size--;
				return { done: false, value: head.value };
			},
			[Symbol.iterator]() {
				return this;
			},
		};
	}

	/** iterates over the queue without draining */
	[Symbol.iterator](): Iterator<T, undefined, undefined> {
		let current = this.#head;

		return {
			next() {
				if (current === undefined) {
					return { done: true, value: undefined };
				}

				const value = current.value;
				current = current.next;

				return { done: false, value: value };
			},
		};
	}
}

export default Queue;
