import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import * as varint from '@atcute/varint';

import type { SyncByteReader } from './sync-byte-reader.js';

interface CarV1Header {
	version: 1;
	roots: CID.CidLink[];
}

const isCarV1Header = (value: unknown): value is CarV1Header => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const { version, roots } = value as CarV1Header;
	return version === 1 && Array.isArray(roots) && roots.every((root) => root instanceof CBOR.CidLinkWrapper);
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
	const head = reader.upto(3 + 4);

	const version = head[0];
	const codec = head[1];
	const digestCodec = head[2];

	if (version !== CID.CID_VERSION) {
		throw new RangeError(`incorrect cid version (got v${version})`);
	}

	if (codec !== CID.CODEC_DCBOR && codec !== CID.CODEC_RAW) {
		throw new RangeError(`incorrect cid codec (got 0x${codec.toString(16)})`);
	}

	if (digestCodec !== CID.HASH_SHA256) {
		throw new RangeError(`incorrect cid hash type (got 0x${digestCodec.toString(16)})`);
	}

	const [digestSize, digestLebSize] = varint.decode(head, 3);

	const bytes = reader.exactly(3 + digestLebSize + digestSize, true);
	const digest = bytes.subarray(3 + digestLebSize);

	const cid: CID.Cid = {
		version: version,
		codec: codec,
		digest: {
			codec: digestCodec,
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
