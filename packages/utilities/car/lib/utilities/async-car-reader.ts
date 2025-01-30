import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import * as varint from '@atcute/varint';

import type { AsyncByteReader } from './async-byte-reader.js';
import { isCarV1Header, type CarV1Header } from './car.js';

const readVarint = async (reader: AsyncByteReader, size: number): Promise<number> => {
	const buf = await reader.upto(size);
	if (buf.length === 0) {
		throw new RangeError(`unexpected end of data`);
	}

	const [int, read] = varint.decode(buf);
	reader.seek(read);

	return int;
};

const readHeader = async (reader: AsyncByteReader): Promise<CarV1Header> => {
	const length = await readVarint(reader, 8);
	if (length === 0) {
		throw new RangeError(`invalid car header; length=0`);
	}

	const rawHeader = await reader.exactly(length, true);
	const header = CBOR.decode(rawHeader);
	if (!isCarV1Header(header)) {
		throw new TypeError(`expected a car v1 archive`);
	}

	return header;
};

const readCid = async (reader: AsyncByteReader): Promise<CID.Cid> => {
	const head = await reader.upto(3 + 4);

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

	const bytes = await reader.exactly(3 + digestLebSize + digestSize, true);
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

const readBlockHeader = async (reader: AsyncByteReader): Promise<{ cid: CID.Cid; blockSize: number }> => {
	const start = reader.pos;

	let size = await readVarint(reader, 8);
	if (size === 0) {
		throw new Error(`invalid car section; length=0`);
	}

	size += reader.pos - start;

	const cid = await readCid(reader);
	const blockSize = size - (reader.pos - start);

	return { cid, blockSize };
};

export const createCarStreamReader = async (reader: AsyncByteReader) => {
	const { roots } = await readHeader(reader);

	let assumedBlockSize = 512;

	return {
		roots,
		async *iterate(): AsyncGenerator<{ cid: CID.Cid; bytes: Uint8Array }> {
			try {
				while ((await reader.upto(8 + assumedBlockSize)).length > 0) {
					const { cid, blockSize } = await readBlockHeader(reader);
					const bytes = await reader.exactly(blockSize, true);

					if (blockSize > assumedBlockSize) {
						assumedBlockSize = blockSize;
					}

					yield { cid, bytes };
				}
			} finally {
				await reader.close();
			}
		},
	};
};
