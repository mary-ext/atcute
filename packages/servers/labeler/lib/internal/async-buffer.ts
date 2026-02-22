export class AsyncBufferFullError extends Error {
	override readonly name = 'AsyncBufferFullError';

	constructor(maxSize: number) {
		super(`reached max buffer size: ${maxSize}`);
	}
}

export class AsyncBuffer<T> {
	private queue = new Queue<T>();
	private closed = false;
	private deferred = Promise.withResolvers<void>();

	constructor(private maxSize: number) {}

	push(value: T): void {
		if (this.closed) {
			return;
		}

		if (this.queue.size >= this.maxSize) {
			this.closed = true;
		}

		this.queue.enqueue(value);
		this.deferred.resolve();
	}

	pushMany(values: T[]): void {
		if (this.closed) {
			return;
		}

		if (this.queue.size + values.length > this.maxSize) {
			this.closed = true;
		}

		for (const value of values) {
			this.queue.enqueue(value);
		}

		this.deferred.resolve();
	}

	close(): void {
		if (this.closed) {
			return;
		}

		this.closed = true;
		this.deferred.resolve();
	}

	async *events(): AsyncGenerator<T> {
		while (true) {
			await this.deferred.promise;

			if (this.queue.size > this.maxSize) {
				throw new AsyncBufferFullError(this.maxSize);
			}

			const value = this.queue.dequeue();
			if (value !== undefined) {
				yield value;
			} else if (this.closed) {
				return;
			} else {
				this.deferred = Promise.withResolvers();
			}
		}
	}
}

class Queue<T> {
	#head: QueueNode<T> | undefined;
	#tail: QueueNode<T> | undefined;
	#size: number = 0;

	get size(): number {
		return this.#size;
	}

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
}

interface QueueNode<T> {
	value: T;
	next: QueueNode<T> | undefined;
}

function createNode<T>(value: T, next: QueueNode<T> | undefined): QueueNode<T> {
	return { value, next };
}
