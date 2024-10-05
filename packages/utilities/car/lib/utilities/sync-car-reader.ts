import * as CBOR from '@atcute/cbor';
import * as varint from '@atcute/varint';
import * as CID from '@atcute/cid';

import type { SyncByteReader } from './byte-reader.js';

interface CarV1Header {
	version: 1;
	roots: CBOR.CIDLink[];
}

const isCarV1Header = (value: unknown): value is CarV1Header => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const { version, roots } = value as CarV1Header;
	return version === 1 && Array.isArray(roots) && roots.every((root) => root instanceof CBOR.CIDLinkWrapper);
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

const readMultihashDigest = (reader: SyncByteReader): CID.Digest => {
	const first = reader.upto(8);

	const [code, codeOffset] = varint.decode(first);
	const [size, sizeOffset] = varint.decode(first.subarray(codeOffset));

	const offset = codeOffset + sizeOffset;

	const bytes = reader.exactly(offset + size, true);
	const digest = bytes.subarray(offset);

	return {
		code: code,
		size: size,
		digest: digest,
		bytes: bytes,
	};
};

const readCid = (reader: SyncByteReader): CID.CID => {
	const version = readVarint(reader, 8);
	if (version !== 1) {
		throw new Error(`expected a cidv1`);
	}

	const codec = readVarint(reader, 8);
	const digest = readMultihashDigest(reader);

	const cid: CID.CID = {
		version: version,
		code: codec,
		digest: digest,
		bytes: CID.encode(version, codec, digest.bytes),
	};

	return cid;
};

const readBlockHeader = (reader: SyncByteReader): { cid: CID.CID; blockSize: number } => {
	const start = reader.pos;

	let size = readVarint(reader, 8);
	if (size === 0) {
		throw new Error(`invalid car section; length=0`);
	}

	size += reader.pos - start;

	const cid = readCid(reader);
	const blockSize = size - Number(reader.pos - start);

	return { cid, blockSize };
};

export const createCarReader = (reader: SyncByteReader) => {
	const { roots } = readHeader(reader);

	return {
		roots,
		*iterate(): Generator<{ cid: CID.CID; bytes: Uint8Array }> {
			while (reader.upto(8).length > 0) {
				const { cid, blockSize } = readBlockHeader(reader);
				const bytes = reader.exactly(blockSize, true);

				yield { cid, bytes };
			}
		},
	};
};
