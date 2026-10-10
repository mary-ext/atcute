import { Queue } from '@mary-ext/ds-queue';

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

	private maxSize: number;

	constructor(maxSize: number) {
		this.maxSize = maxSize;
	}

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
