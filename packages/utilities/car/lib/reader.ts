import * as CBOR from '@atcute/cbor';
import type { CidLink } from '@atcute/cid';
import * as CID from '@atcute/cid';
import * as varint from '@atcute/varint';

import { isCarV1Header, type CarEntry, type CarHeader } from './types.js';

interface SyncByteReader {
	readonly pos: number;
	upto(size: number): Uint8Array;
	exactly(size: number, seek: boolean): Uint8Array;
	seek(size: number): void;
}

export interface SyncCarReader {
	readonly header: CarHeader;
	readonly roots: CidLink[];

	/** @deprecated do for..of on the reader directly */
	iterate(): Generator<CarEntry>;
	[Symbol.iterator](): Iterator<CarEntry>;
}

export const fromUint8Array = (buffer: Uint8Array): SyncCarReader => {
	const reader = createUint8Reader(buffer);
	const header = readHeader(reader);

	return {
		header,
		roots: header.data.roots,

		*iterate() {
			while (reader.upto(8 + 36).length > 0) {
				const entryStart = reader.pos;
				const entrySize = readVarint(reader, 8);

				const cidStart = reader.pos;
				const cid = readCid(reader);

				const bytesStart = reader.pos;
				const bytesSize = entrySize - (bytesStart - cidStart);
				const bytes = reader.exactly(bytesSize, true);

				const cidEnd = bytesStart;
				const bytesEnd = reader.pos;
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

		[Symbol.iterator](): Iterator<CarEntry> {
			return this.iterate();
		},
	};
};

const createUint8Reader = (buf: Uint8Array): SyncByteReader => {
	let pos = 0;

	return {
		get pos() {
			return pos;
		},

		seek(size) {
			if (size > buf.length - pos) {
				throw new RangeError('unexpected end of data');
			}

			pos += size;
		},
		upto(size) {
			return buf.subarray(pos, pos + size);
		},
		exactly(size, seek) {
			if (size > buf.length - pos) {
				throw new RangeError('unexpected end of data');
			}

			const slice = buf.subarray(pos, pos + size);
			if (seek) {
				pos += size;
			}

			return slice;
		},
	};
};

const readVarint = (reader: SyncByteReader, size: number): number => {
	const buf = reader.upto(size);
	if (buf.length === 0) {
		throw new RangeError(`unexpected end of data`);
	}

	const [int, read] = varint.decode(buf);
	reader.seek(read);

	return int;
};

const readHeader = (reader: SyncByteReader): CarHeader => {
	const headerStart = reader.pos;
	const length = readVarint(reader, 8);
	if (length === 0) {
		throw new RangeError(`invalid car header; length=0`);
	}

	const dataStart = reader.pos;
	const rawHeader = reader.exactly(length, true);

	const data = CBOR.decode(rawHeader);
	if (!isCarV1Header(data)) {
		throw new TypeError(`expected a car v1 archive`);
	}

	const dataEnd = reader.pos;
	const headerEnd = dataEnd;

	return { data, headerStart, headerEnd, dataStart, dataEnd };
};

const readCid = (reader: SyncByteReader): CID.Cid => {
	const bytes = reader.exactly(36, true);

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
