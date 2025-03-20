import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import * as varint from '@atcute/varint';

import { isCarV1Header, type CarV1Header } from './car.js';
import type { SyncByteReader } from './sync-byte-reader.js';

const readVarint = (reader: SyncByteReader, size: number): number => {
	const buf = reader.upto(size);
	if (buf.length === 0) {
		throw new RangeError(`unexpected end of data`);
	}

	const [int, read] = varint.decode(buf);
	reader.seek(read);

	return int;
};

const readHeader = (reader: SyncByteReader): CarV1Header => {
	const length = readVarint(reader, 8);
	if (length === 0) {
		throw new RangeError(`invalid car header; length=0`);
	}

	const rawHeader = reader.exactly(length, true);
	const header = CBOR.decode(rawHeader);
	if (!isCarV1Header(header)) {
		throw new TypeError(`expected a car v1 archive`);
	}

	return header;
};

const readCid = (reader: SyncByteReader): CID.Cid => {
	const bytes = reader.exactly(4 + 32, true);
	const digest = bytes.subarray(4, 36);

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
		throw new RangeError(`incorrect cid hash type (got 0x${digestType.toString(16)})`);
	}

	if (digestSize !== 32) {
		throw new RangeError(`incorrect cid digest size (got ${digestSize})`);
	}

	const cid: CID.Cid = {
		version: version,
		codec: codec,
		digest: {
			codec: digestType,
			contents: digest,
		},
		bytes: bytes,
	};

	return cid;
};

export interface CarEntry {
	cid: CID.Cid;
	bytes: Uint8Array;

	entryStart: number;
	entryEnd: number;

	cidStart: number;
	cidEnd: number;

	bytesStart: number;
	bytesEnd: number;
}

export const createCarReader = (reader: SyncByteReader) => {
	const { roots } = readHeader(reader);

	return {
		roots,
		*iterate(): Generator<CarEntry> {
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
	};
};
