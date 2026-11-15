import {
	DEFAULT_MAX_KEY_LENGTH,
	DEFAULT_MAX_META_LENGTH,
	DEFAULT_MAX_VALUE_LENGTH,
	END_MARKER,
	MAX_VARINT_BYTES,
	PAIR_MARKER,
	STAR_MAGIC,
} from './constants.ts';
import type { StarEntry, StarHeader, StarMeta, StarReaderOptions } from './types.ts';
import { assertStarMagic, decodeStarMeta, resolveLimit } from './utils.ts';

export interface StreamedStarReader {
	header(): Promise<StarHeader>;
	meta(): Promise<StarMeta>;

	dispose(): Promise<void>;

	[Symbol.asyncDispose](): Promise<void>;
	[Symbol.asyncIterator](): AsyncIterator<StarEntry>;
}

/**
 * creates a transform stream from STAR bytes to key-value entries
 *
 * @param options reader options
 * @returns a stream pair; read errors propagate to the readable stream
 */
export const starEntryTransform = (
	options?: StarReaderOptions,
): ReadableWritablePair<StarEntry, Uint8Array> => {
	const transform = new TransformStream<Uint8Array, Uint8Array>();
	let star: StreamedStarReader | undefined;

	return {
		readable: new ReadableStream({
			async start(controller) {
				star = fromStream(transform.readable, options);

				try {
					for await (const entry of star) {
						controller.enqueue(entry);
					}

					await star.dispose();

					controller.close();
				} catch (err) {
					controller.error(err);

					await star.dispose();
				}
			},
			async cancel() {
				if (star !== undefined) {
					await star.dispose();
				}
			},
		}),
		writable: transform.writable,
	};
};

/**
 * reads a STAR archive from a stream
 *
 * @param stream the STAR archive byte stream
 * @param options reader options
 * @returns a reader for the header and key-value pairs
 * @throws during reads or iteration if the archive is malformed or exceeds the configured limits
 */
export const fromStream = (
	stream: ReadableStream<Uint8Array>,
	options?: StarReaderOptions,
): StreamedStarReader => {
	const maxMetaLength = resolveLimit(options?.maxMetaLength, DEFAULT_MAX_META_LENGTH);
	const maxKeyLength = resolveLimit(options?.maxKeyLength, DEFAULT_MAX_KEY_LENGTH);
	const maxValueLength = resolveLimit(options?.maxValueLength, DEFAULT_MAX_VALUE_LENGTH);

	let chunk: Uint8Array = new Uint8Array(0);
	let chunkPos = 0;
	let offset = 0;

	let _header: Promise<StarHeader> | undefined;

	const reader = stream.getReader();

	const refill = async (): Promise<boolean> => {
		while (chunkPos >= chunk.length) {
			const { value, done } = await reader.read();
			if (done) {
				return false;
			}

			chunk = value;
			chunkPos = 0;
		}

		return true;
	};

	const readLength = async (maxLength: number): Promise<number> => {
		let value = 0;

		for (let i = 0; i < MAX_VARINT_BYTES; i++) {
			if (chunkPos >= chunk.length && !(await refill())) {
				throw new RangeError('unexpected end of data');
			}

			const byte = chunk[chunkPos++]!;
			offset++;

			// bitwise shifts would truncate lengths above 32 bits
			value += (byte & 0x7f) * 2 ** (7 * i);

			if (byte < 0x80) {
				if (value > maxLength) {
					throw new RangeError(`star frame exceeds limit; length=${value} limit=${maxLength}`);
				}

				return value;
			}
		}

		throw new RangeError(`varint too long`);
	};

	const readExact = async (n: number): Promise<Uint8Array> => {
		if (chunkPos + n <= chunk.length) {
			const buffer = chunk.subarray(chunkPos, chunkPos + n);
			chunkPos += n;
			offset += n;
			return buffer;
		}

		const buffer = new Uint8Array(n);
		let written = 0;

		while (written < n) {
			if (chunkPos >= chunk.length && !(await refill())) {
				throw new RangeError('unexpected end of data');
			}

			const taken = Math.min(n - written, chunk.length - chunkPos);
			buffer.set(chunk.subarray(chunkPos, chunkPos + taken), written);

			written += taken;
			chunkPos += taken;
		}

		offset += n;
		return buffer;
	};

	const readHeader = async (): Promise<StarHeader> => {
		const headerStart = offset;

		assertStarMagic(await readExact(STAR_MAGIC.length));

		const dataSize = await readLength(maxMetaLength);
		const dataStart = offset;
		const data = decodeStarMeta(await readExact(dataSize));
		const dataEnd = offset;
		const headerEnd = offset;

		return { data, headerStart, headerEnd, dataStart, dataEnd };
	};

	return {
		[Symbol.asyncDispose]() {
			return this.dispose();
		},

		async dispose() {
			await reader.cancel();
		},

		header(): Promise<StarHeader> {
			return (_header ??= readHeader());
		},

		async meta(): Promise<StarMeta> {
			const header = await this.header();

			return header.data;
		},

		async *[Symbol.asyncIterator](): AsyncGenerator<StarEntry> {
			await this.header();

			while (true) {
				if (chunkPos >= chunk.length && !(await refill())) {
					throw new RangeError('unexpected end of data');
				}

				const entryStart = offset;
				const marker = chunk[chunkPos++]!;
				offset++;

				if (marker === END_MARKER) {
					if (chunkPos < chunk.length || (await refill())) {
						throw new RangeError('unexpected trailing data');
					}

					return;
				}

				if (marker !== PAIR_MARKER) {
					throw new TypeError(`unexpected star marker byte; got 0x${marker.toString(16).padStart(2, '0')}`);
				}

				const keySize = await readLength(maxKeyLength);
				const keyStart = offset;
				const key = await readExact(keySize);
				const keyEnd = offset;

				const valueSize = await readLength(maxValueLength);
				const valueStart = offset;
				const value = await readExact(valueSize);
				const valueEnd = offset;

				yield {
					key,
					value,

					entryStart,
					entryEnd: valueEnd,
					keyStart,
					keyEnd,
					valueStart,
					valueEnd,
				};
			}
		},
	};
};
