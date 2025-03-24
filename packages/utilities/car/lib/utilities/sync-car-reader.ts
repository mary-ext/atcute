import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import * as varint from '@atcute/varint';

import { isCarV1Header, type CarEntry, type CarHeader } from './car.js';
import type { SyncByteReader } from './sync-byte-reader.js';

export interface SyncCarReader {
	header: CarHeader;
	iterate(): Generator<CarEntry>;
}

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
	const head = reader.exactly(4, false);

	const version = head[0];
	const codec = head[1];
	const digestType = head[2];
	const digestSize = head[3];

	if (version !== CID.CID_VERSION) {
		throw new RangeError(`incorrect cid version (got v${version})`);
	}

	if (codec !== CID.CODEC_DCBOR && codec !== CID.CODEC_RAW) {
		throw new RangeError(`incorrect cid codec (got 0x${codec.toString(16)})`);
	}

	if (digestType !== CID.HASH_SHA256) {
		throw new RangeError(`incorrect cid digest type (got 0x${digestType.toString(16)})`);
	}

	if (digestSize !== 32 && digestSize !== 0) {
		throw new RangeError(`incorrect cid digest size (got ${digestSize})`);
	}

	const bytes = reader.exactly(4 + digestSize, true);
	const digest = bytes.subarray(4, 4 + digestSize);

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

export const createCarReader = (reader: SyncByteReader): SyncCarReader => {
	const header = readHeader(reader);

	return {
		header,
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
	};
};
