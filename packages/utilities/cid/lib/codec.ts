import { fromBase32, toBase32 } from '@atcute/multibase';
import { allocUnsafe } from '@atcute/uint8array';
import * as varint from '@atcute/varint';

export const CID_VERSION = 1;
export const HASH_SHA256 = 0x12;

export const CODEC_RAW = 0x55;
export const CODEC_DCBOR = 0x71;

/**
 * Represents a Content Identifier (CID), in particular, a limited subset of
 * CIDv1 as described by DASL specifications.
 * https://dasl.ing/cid.html
 */
export interface Cid {
	/** CID version, this is always `1` for CIDv1 */
	version: number;
	/** Multicodec type for the data, can be `0x55` for raw data or `0x71` for DAG-CBOR */
	codec: number;
	/** Digest contents */
	digest: {
		/** Multicodec type for the digest, this is always `0x12` for SHA-256 */
		codec: number;
		/** Raw hash bytes */
		contents: Uint8Array;
	};
	/** Raw CID bytes */
	bytes: Uint8Array;
}

export const create = async (codec: 0x55 | 0x71, data: Uint8Array): Promise<Cid> => {
	const digest = new Uint8Array(await crypto.subtle.digest('sha-256', data));

	const digestSize = digest.length;
	const digestLebSize = varint.encodingLength(digestSize);

	const bytes = allocUnsafe(3 + digestLebSize + digestSize);

	bytes[0] = CID_VERSION;
	bytes[1] = codec;
	bytes[2] = HASH_SHA256;

	varint.encode(digestSize, bytes, 3);
	bytes.set(digest, 3 + digestLebSize);

	const cid: Cid = {
		version: CID_VERSION,
		codec: codec,
		digest: {
			codec: HASH_SHA256,
			contents: digest,
		},
		bytes: bytes,
	};

	return cid;
};

export const decodeFirst = (bytes: Uint8Array): [decoded: Cid, remainder: Uint8Array] => {
	const length = bytes.length;

	if (length < 5) {
		throw new RangeError(`cid too short`);
	}

	const version = bytes[0];
	const codec = bytes[1];
	const digestCodec = bytes[2];

	if (version !== CID_VERSION) {
		throw new RangeError(`incorrect cid version (got v${version})`);
	}

	if (codec !== CODEC_DCBOR && codec !== CODEC_RAW) {
		throw new RangeError(`incorrect cid codec (got 0x${codec.toString(16)})`);
	}

	if (digestCodec !== HASH_SHA256) {
		throw new RangeError(`incorrect cid hash type (got 0x${digestCodec.toString(16)})`);
	}

	const [digestSize, digestLebSize] = varint.decode(bytes, 3);
	const digestOffset = 3 + digestLebSize;

	if (length - digestOffset < digestSize) {
		throw new RangeError(`digest too short (expected ${digestSize} bytes; got ${length - digestOffset})`);
	}

	const remainder = bytes.subarray(digestOffset + digestSize);

	const cid: Cid = {
		version: CID_VERSION,
		codec: codec,
		digest: {
			codec: digestCodec,
			contents: bytes.subarray(digestOffset, digestOffset + digestSize),
		},
		bytes: bytes.subarray(0, digestOffset + digestSize),
	};

	return [cid, remainder];
};

export const decode = (bytes: Uint8Array): Cid => {
	const [cid, remainder] = decodeFirst(bytes);

	if (remainder.length !== 0) {
		throw new RangeError(`cid bytes includes remainder`);
	}

	return cid;
};

export const fromString = (input: string): Cid => {
	if (input.length < 2 || input[0] !== 'b') {
		throw new SyntaxError(`not a multibase base32 string`);
	}

	const bytes = fromBase32(input.slice(1));
	return decode(bytes);
};

export const toString = (cid: Cid): string => {
	const encoded = toBase32(cid.bytes);
	return `b${encoded}`;
};

export const fromBinary = (input: Uint8Array): Cid => {
	if (input.length < 2) {
		throw new RangeError(`cid bytes too short`);
	}

	if (input[0] !== 0) {
		throw new SyntaxError(`incorrect binary cid`);
	}

	const bytes = input.subarray(1);
	return decode(bytes);
};

export const toBinary = (cid: Cid): Uint8Array => {
	const bytes = allocUnsafe(1 + cid.bytes.length);
	bytes[0] = 0;
	bytes.set(cid.bytes, 1);

	return bytes;
};
