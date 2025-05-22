import type { CarEntry } from './utilities/car.js';
import { createStreamedCarReader, type StreamedCarReader } from './utilities/stream-car-reader.js';
import { createUint8Reader } from './utilities/sync-byte-reader.js';
import { createCarReader, type SyncCarReader } from './utilities/sync-car-reader.js';

export type { CarEntry, CarHeader, CarV1Header } from './utilities/car.js';
export type { StreamedCarReader } from './utilities/stream-car-reader.js';
export type { SyncCarReader } from './utilities/sync-car-reader.js';

export const readCar = (buffer: Uint8Array): SyncCarReader => {
	const reader = createUint8Reader(buffer);
	return createCarReader(reader);
};

export const getStreamedCarReader = (stream: ReadableStream<Uint8Array>): StreamedCarReader => {
	return createStreamedCarReader(stream);
};

export const getCarTransform = (): ReadableWritablePair<CarEntry, Uint8Array> => {
	const internalTransform = new TransformStream();
	const reader = createStreamedCarReader(internalTransform.readable);
	const iterator = reader[Symbol.asyncIterator]();

	return {
		writable: internalTransform.writable,
		readable: new ReadableStream<CarEntry>({
			async pull(controller) {
				try {
					const entry = await iterator.next();
					if (entry.done) {
						controller.close();
					} else {
						controller.enqueue(entry.value);
					}
				} catch (error) {
					controller.error(error);
				}
			},
			async cancel() {
				await reader[Symbol.asyncDispose]();
			},
		}),
	};
};
