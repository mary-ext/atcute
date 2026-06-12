import * as CBOR from '@atcute/cbor';
import type { CidLink } from '@atcute/cid';
import * as CID from '@atcute/cid';
import * as varint from '@atcute/varint';

import { type CarEntry, type CarHeader, isCarV1Header } from './types.ts';

export interface SyncCarReader {
	readonly header: CarHeader;
	readonly roots: CidLink[];

	[Symbol.iterator](): IterableIterator<CarEntry>;
}

export const fromUint8Array = (buffer: Uint8Array): SyncCarReader => {
	const { header, nextOffset: headerOffset } = readHeader(buffer, 0);
	let pos = headerOffset;

	return {
		header,
		roots: header.data.roots,

		[Symbol.iterator](): IterableIterator<CarEntry> {
			return {
				next(): IteratorResult<CarEntry> {
					if (pos >= buffer.length) {
						return {
							done: true,
							value: undefined,
						};
					}

					const entryStart = pos;
					const { value: entryLength, nextOffset: lengthOffset } = varint.decode(buffer, pos, 8);
					pos = lengthOffset;

					if (entryLength < 36) {
						throw new RangeError(`invalid car block; length=${entryLength}`);
					}

					const cidStart = pos;
					const { cid, nextOffset: cidOffset } = readCid(buffer, pos);
					pos = cidOffset;

					const bytesStart = pos;
					const bytesSize = entryLength - 36;
					if (bytesStart + bytesSize > buffer.length) {
						throw new RangeError('unexpected end of data');
					}

					const bytesEnd = bytesStart + bytesSize;
					const bytes = buffer.subarray(bytesStart, bytesEnd);
					pos = bytesEnd;

					const cidEnd = bytesStart;
					const entryEnd = bytesEnd;

					return {
						done: false,
						value: {
							cid,
							bytes,

							entryStart,
							entryEnd,
							cidStart,
							cidEnd,
							bytesStart,
							bytesEnd,
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

const readHeader = (source: Uint8Array, offset: number): { header: CarHeader; nextOffset: number } => {
	const headerStart = offset;
	const { value: length, nextOffset: lengthOffset } = varint.decode(source, offset, 8);
	if (length === 0) {
		throw new RangeError(`invalid car header; length=0`);
	}

	const dataStart = lengthOffset;
	const dataEnd = dataStart + length;
	if (dataEnd > source.length) {
		throw new RangeError('unexpected end of data');
	}

	const data = CBOR.decode(source.subarray(dataStart, dataEnd));
	if (!isCarV1Header(data)) {
		throw new TypeError(`expected a car v1 archive`);
	}

	const headerEnd = dataEnd;

	return {
		header: { data, headerStart, headerEnd, dataStart, dataEnd },
		nextOffset: dataEnd,
	};
};

const readCid = (source: Uint8Array, offset: number): { cid: CID.Cid; nextOffset: number } => {
	const cidEnd = offset + 36;
	if (cidEnd > source.length) {
		throw new RangeError('unexpected end of data');
	}

	const bytes = source.subarray(offset, cidEnd);

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
		cid: {
			version: version,
			codec: codec,
			digest: {
				codec: digestType,
				contents: bytes.subarray(4, 36),
			},
			bytes: bytes,
		},
		nextOffset: cidEnd,
	};
};
