import * as CBOR from '@atcute/cbor';
import type { Cid, CidLink } from '@atcute/cid';
import * as CID from '@atcute/cid';

import { type CarEntry, type CarHeader, isCarV1Header } from './types.ts';

export interface StreamedCarReader {
	header(): Promise<CarHeader>;
	roots(): Promise<CidLink[]>;

	dispose(): Promise<void>;

	[Symbol.asyncDispose](): Promise<void>;
	[Symbol.asyncIterator](): AsyncIterator<CarEntry>;
}

export const carEntryTransform = (): ReadableWritablePair<CarEntry, Uint8Array> => {
	const transform = new TransformStream<Uint8Array, Uint8Array>();
	let car: StreamedCarReader | undefined;

	return {
		readable: new ReadableStream({
			async start(controller) {
				car = fromStream(transform.readable);

				try {
					for await (const entry of car) {
						controller.enqueue(entry);
					}

					await car.dispose();

					controller.close();
				} catch (err) {
					controller.error(err);
				}
			},
			async cancel() {
				if (car !== undefined) {
					await car.dispose();
				}
			},
		}),
		writable: transform.writable,
	};
};

export const fromStream = (stream: ReadableStream<Uint8Array>): StreamedCarReader => {
	let chunk = new Uint8Array(0) as Uint8Array; // annoying!
	let offset = 0;

	let _header: CarHeader | undefined;

	const reader = stream.getReader();

	const readVarint = async (): Promise<number> => {
		let value = 0;
		let shift = 0;

		const MSB = 0x80;
		const REST = 0x7f;

		while (true) {
			if (chunk.length === 0) {
				const { value, done } = await reader.read();
				if (done) {
					throw new Error(`unexpected eof while decoding varint`);
				}

				chunk = value;
			}

			const byte = chunk[0];
			chunk = chunk.subarray(1);

			value += shift < 28 ? (byte & REST) << shift : (byte & REST) * 2 ** shift;
			shift += 7;

			offset++;

			if ((byte & MSB) === 0) {
				return value;
			}
		}
	};

	const readExact = async (n: number): Promise<Uint8Array> => {
		const buffer = new Uint8Array(n);
		let written = 0;

		while (written < n) {
			if (chunk.length === 0) {
				const { value, done } = await reader.read();

				if (done) {
					throw new Error('unexpected eof while reading data');
				}

				chunk = value;
			}

			const taken = Math.min(n - written, chunk.length);
			buffer.set(chunk.subarray(0, taken), written);

			written += taken;
			chunk = chunk.subarray(taken);
		}

		offset += n;
		return buffer;
	};

	const readCid = async (): Promise<Cid> => {
		const bytes = await readExact(36);

		const version = bytes[0];
		const codec = bytes[1];
		const digestType = bytes[2];
		const digestSize = bytes[3];

		if (version !== CID.CID_VERSION) {
			throw new RangeError(`incorrect cid version (got v${version})`);
		}

		if (codec !== CID.CODEC_DCBOR && codec !== CID.CODEC_RAW) {
			throw new RangeError(`incorrect cid codec (got 0x${codec.toString(16)})`);
		}

		if (digestType !== CID.HASH_SHA256) {
			throw new RangeError(`incorrect cid digest type (got 0x${digestType.toString(16)})`);
		}

		if (digestSize !== 32) {
			throw new RangeError(`incorrect cid digest size (got ${digestSize})`);
		}

		return {
			version: version,
			codec: codec,
			digest: {
				codec: digestType,
				contents: bytes.subarray(4, 36),
			},
			bytes: bytes,
		};
	};

	return {
		[Symbol.asyncDispose]() {
			return this.dispose();
		},

		async dispose() {
			await reader.cancel();
		},

		async header(): Promise<CarHeader> {
			if (_header !== undefined) {
				return _header;
			}

			const headerStart = offset;

			const headerSize = await readVarint();
			if (headerSize === 0) {
				throw new RangeError(`invalid car header; length=0`);
			}

			const dataStart = offset;

			const raw = await readExact(headerSize);
			const data = CBOR.decode(raw);
			if (!isCarV1Header(data)) {
				throw new TypeError(`expected a car v1 archive`);
			}

			const dataEnd = offset;
			const headerEnd = offset;

			return (_header = { data, headerStart, headerEnd, dataStart, dataEnd });
		},

		async roots(): Promise<CidLink[]> {
			const header = await this.header();

			return header.data.roots;
		},

		async *[Symbol.asyncIterator](): AsyncGenerator<CarEntry> {
			// ensure the header is read first
			if (_header === undefined) {
				await this.header();
			}

			while (true) {
				if (chunk.length === 0) {
					const { value, done } = await reader.read();

					if (done) {
						return;
					}

					chunk = value;
				}

				const entryStart = offset;
				const entrySize = await readVarint();

				const cidStart = offset;
				const cid = await readCid();

				const bytesStart = offset;
				const bytesSize = entrySize - (bytesStart - cidStart);
				const bytes = await readExact(bytesSize);

				const cidEnd = bytesStart;
				const bytesEnd = offset;
				const entryEnd = bytesEnd;

				yield {
					cid,
					bytes,

					entryStart,
					entryEnd,
					cidStart,
					cidEnd,
					bytesStart,
					bytesEnd,
				};
			}
		},
	};
};
