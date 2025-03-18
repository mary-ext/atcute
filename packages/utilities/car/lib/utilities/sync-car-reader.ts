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

const readBlockHeader = (reader: SyncByteReader): { cid: CID.Cid; blockSize: number } => {
	const start = reader.pos;

	let size = readVarint(reader, 8);
	if (size === 0) {
		throw new Error(`invalid car section; length=0`);
	}

	size += reader.pos - start;

	const cid = readCid(reader);
	const blockSize = size - (reader.pos - start);

	return { cid, blockSize };
};

export const createCarReader = (reader: SyncByteReader) => {
	const { roots } = readHeader(reader);

	return {
		roots,
		*iterate(): Generator<{ cid: CID.Cid; bytes: Uint8Array }> {
			while (reader.upto(8).length > 0) {
				const { cid, blockSize } = readBlockHeader(reader);
				const bytes = reader.exactly(blockSize, true);

				yield { cid, bytes };
			}
		},
	};
};
