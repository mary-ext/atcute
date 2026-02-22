import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';

import { AsyncBuffer } from './async-buffer.ts';

export interface OnOptions {
	maxSize: number;
	signal?: AbortSignal;
}

export const on = <T>(
	emitter: SimpleEventEmitter<[value: T]>,
	options: OnOptions,
): AsyncIterableIterator<T> => {
	const { maxSize, signal } = options;

	signal?.throwIfAborted();

	const buffer = new AsyncBuffer<T>(maxSize);
	const unsubscribe = emitter.subscribe((value: T) => {
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
