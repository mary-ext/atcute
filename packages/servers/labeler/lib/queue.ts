interface Node<T> {
	value: T;
	next: Node<T> | undefined;
}

/** a FIFO queue backed by a linked list. */
export class Queue<T> {
	#head: Node<T> | undefined;
	#tail: Node<T> | undefined;
	#size: number = 0;

	/** number of items in the queue */
	get size(): number {
		return this.#size;
	}

	/**
	 * add a value to the end of the queue.
	 * @param value value to enqueue
	 */
	enqueue(value: T): void {
		const node: Node<T> = { value, next: undefined };
		const tail = this.#tail;

		if (tail !== undefined) {
			tail.next = node;
		} else {
			this.#head = node;
		}

		this.#tail = node;
		this.#size++;
	}

	/**
	 * remove and return the first value from the queue.
	 * @returns first queued value, or undefined if empty
	 */
	dequeue(): T | undefined {
		const head = this.#head;
		if (head === undefined) {
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
}
