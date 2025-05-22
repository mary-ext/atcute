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

export const readCarStream = (stream: ReadableStream<Uint8Array>): StreamedCarReader => {
	return createStreamedCarReader(stream);
};
