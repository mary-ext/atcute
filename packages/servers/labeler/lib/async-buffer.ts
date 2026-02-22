import type { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';

import { Queue } from './queue.ts';

/** thrown when the async buffer exceeds its maximum size. */
export class AsyncBufferFullError extends Error {
	constructor(maxSize: number) {
		super(`reached max buffer size: ${maxSize}`);
	}
}

/** bounded async buffer with backpressure support. */
export class AsyncBuffer<T> {
	#queue = new Queue<T>();
	#closed = false;
	#deferred = Promise.withResolvers<void>();

	#maxSize: number;

	constructor(maxSize: number) {
		this.#maxSize = maxSize;
	}

	push(value: T): void {
		if (this.#closed) {
			return;
		}

		if (this.#queue.size >= this.#maxSize) {
			this.#closed = true;
		}

		this.#queue.enqueue(value);
		this.#deferred.resolve();
	}

	close(): void {
		if (this.#closed) {
			return;
		}

		this.#closed = true;
		this.#deferred.resolve();
	}

	async *events(): AsyncGenerator<T> {
		while (true) {
			await this.#deferred.promise;

			if (this.#queue.size > this.#maxSize) {
				throw new AsyncBufferFullError(this.#maxSize);
			}

			const value = this.#queue.dequeue();
			if (value !== undefined) {
				yield value;
			} else if (this.#closed) {
				return;
			} else {
				this.#deferred = Promise.withResolvers();
			}
		}
	}
}

export interface OnOptions {
	maxSize: number;
	signal?: AbortSignal;
}

/**
 * create an async iterator from a SimpleEventEmitter with bounded buffering.
 * @param emitter event emitter
 * @param options buffer and signal options
 * @returns async iterator of event payloads
 */
export const on = <T>(emitter: SimpleEventEmitter<[T]>, options: OnOptions): AsyncIterableIterator<T> => {
	const { maxSize, signal } = options;

	signal?.throwIfAborted();

	const buffer = new AsyncBuffer<T>(maxSize);
	const unsubscribe = emitter.subscribe((value) => {
		buffer.push(value);
	});

	const cleanup = () => {
		unsubscribe();
		buffer.close();

		signal?.removeEventListener('abort', cleanup);
	};

	signal?.addEventListener('abort', cleanup, { once: true });

	return (async function* () {
		try {
			yield* buffer.events();
		} finally {
			cleanup();
		}
	})();
};
