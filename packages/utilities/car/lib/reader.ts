import { createStreamReader } from './utilities/async-byte-reader.js';
import { createCarStreamReader } from './utilities/async-car-reader.js';
import { createUint8Reader } from './utilities/sync-byte-reader.js';
import { createCarReader } from './utilities/sync-car-reader.js';

export const readCar = (buffer: Uint8Array) => {
	const reader = createUint8Reader(buffer);
	return createCarReader(reader);
};

export const readCarStream = (stream: AsyncIterable<Uint8Array>) => {
	const reader = createStreamReader(stream);
	return createCarStreamReader(reader);
};
