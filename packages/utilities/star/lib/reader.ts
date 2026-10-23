import {
	MAX_KEY_LENGTH,
	MAX_META_LENGTH,
	MAX_VALUE_LENGTH,
	MAX_VARINT_BYTES,
	STAR_MAGIC,
} from './constants.ts';
import type { StarEntry, StarHeader, StarMeta, StarReaderOptions } from './types.ts';
import { assertStarMagic, decodeStarMeta, resolveLimit } from './utils.ts';

export interface SyncStarReader {
	readonly header: StarHeader;
	readonly meta: StarMeta;

	[Symbol.iterator](): IterableIterator<StarEntry>;
}

/**
 * reads a STAR archive from a buffer
 *
 * @param buffer the STAR archive bytes
 * @param options reader options
 * @returns the archive header and an iterable of key-value pairs
 * @throws if the header is malformed
 * @throws during iteration if a pair is malformed or exceeds the configured limits
 */
export const fromUint8Array = (buffer: Uint8Array, options?: StarReaderOptions): SyncStarReader => {
	const maxKeyLength = resolveLimit(options?.maxKeyLength, MAX_KEY_LENGTH);
	const maxValueLength = resolveLimit(options?.maxValueLength, MAX_VALUE_LENGTH);

	const header = readHeader(buffer);

	return {
		header,
		meta: header.data,

		[Symbol.iterator](): IterableIterator<StarEntry> {
			let pos = header.headerEnd;

			return {
				next(): IteratorResult<StarEntry> {
					// EOF is only allowed at a pair boundary
					if (pos >= buffer.length) {
						return {
							done: true,
							value: undefined,
						};
					}

					const entryStart = pos;

					const { start: keyStart, end: keyEnd } = readFrame(buffer, pos, maxKeyLength);
					const { start: valueStart, end: valueEnd } = readFrame(buffer, keyEnd, maxValueLength);

					pos = valueEnd;

					return {
						done: false,
						value: {
							key: buffer.subarray(keyStart, keyEnd),
							value: buffer.subarray(valueStart, valueEnd),

							entryStart,
							entryEnd: valueEnd,
							keyStart,
							keyEnd,
							valueStart,
							valueEnd,
						},
					};
				},

				[Symbol.iterator]() {
					return this;
				},
			};
		},
	};
};

const readHeader = (source: Uint8Array): StarHeader => {
	const magicSize = STAR_MAGIC.length;
	if (source.length < magicSize) {
		throw new RangeError('unexpected end of data');
	}

	assertStarMagic(source.subarray(0, magicSize));

	const { start: dataStart, end: dataEnd } = readFrame(source, magicSize, MAX_META_LENGTH);
	const data = decodeStarMeta(source.subarray(dataStart, dataEnd));

	return { data, headerStart: 0, headerEnd: dataEnd, dataStart, dataEnd };
};

const readFrame = (source: Uint8Array, offset: number, maxLength: number): { start: number; end: number } => {
	const { value: length, nextOffset: start } = readLength(source, offset);
	if (length > maxLength) {
		throw new RangeError(`star frame exceeds limit; length=${length} limit=${maxLength}`);
	}

	const end = start + length;
	if (end > source.length) {
		throw new RangeError('unexpected end of data');
	}

	return { start, end };
};

// STAR limits varints to six bytes and distinguishes truncation from overlong input
const readLength = (source: Uint8Array, offset: number): { value: number; nextOffset: number } => {
	let value = 0;

	for (let i = 0; i < MAX_VARINT_BYTES; i++) {
		const pos = offset + i;
		if (pos >= source.length) {
			throw new RangeError('unexpected end of data');
		}

		const byte = source[pos]!;
		// bitwise shifts would truncate lengths above 32 bits
		value += (byte & 0x7f) * 2 ** (7 * i);

		if (byte < 0x80) {
			return { value, nextOffset: pos + 1 };
		}
	}

	throw new RangeError(`varint too long`);
};
