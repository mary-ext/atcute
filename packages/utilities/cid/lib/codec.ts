import { fromBase32, toBase32 } from '@atcute/multibase';
import { allocUnsafe, toSha256 } from '@atcute/uint8array';

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

// a SHA-256 CIDv1 is always going to be 36 bytes, that's 4 bytes for the
// header, and 32 bytes for the digest itself.

export const create = async (codec: 0x55 | 0x71, data: Uint8Array): Promise<Cid> => {
	const digest = await toSha256(data);
	if (digest.length !== 32) {
		throw new RangeError(`invalid digest length`);
	}

	const bytes = allocUnsafe(4 + 32);

	bytes[0] = CID_VERSION;
	bytes[1] = codec;
	bytes[2] = HASH_SHA256;
	bytes[3] = 32;

	bytes.set(digest, 4);

	const cid: Cid = {
		version: CID_VERSION,
		codec: codec,
		digest: {
			codec: HASH_SHA256,
			contents: bytes.subarray(4, 36),
		},
		bytes: bytes,
	};

	return cid;
};

export const createEmpty = (codec: 0x55 | 0x71): Cid => {
	const bytes = Uint8Array.from([CID_VERSION, codec, HASH_SHA256, 0]);
	const digest = bytes.subarray(4);

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

	if (length < 4) {
		throw new RangeError(`cid too short`);
	}

	const version = bytes[0];
	const codec = bytes[1];
	const digestType = bytes[2];
	const digestSize = bytes[3];

	if (version !== CID_VERSION) {
		throw new RangeError(`incorrect cid version (got v${version})`);
	}

	if (codec !== CODEC_DCBOR && codec !== CODEC_RAW) {
		throw new RangeError(`incorrect cid codec (got 0x${codec.toString(16)})`);
	}

	if (digestType !== HASH_SHA256) {
		throw new RangeError(`incorrect cid digest codec (got 0x${digestType.toString(16)})`);
	}

	if (digestSize !== 32 && digestSize !== 0) {
		throw new RangeError(`incorrect cid digest size (got ${digestSize})`);
	}

	if (length < 4 + digestSize) {
		throw new RangeError(`cid too short`);
	}

	const cid: Cid = {
		version: CID_VERSION,
		codec: codec,
		digest: {
			codec: digestType,
			contents: bytes.subarray(4, 4 + digestSize),
		},
		bytes: bytes.subarray(0, 4 + digestSize),
	};

	return [cid, bytes.subarray(4 + digestSize)];
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

	// 4 bytes in base32 = 7 characters + 1 character for the prefix
	// 36 bytes in base32 = 58 characters + 1 character for the prefix
	if (input.length !== 59 && input.length !== 8) {
		throw new RangeError(`cid too short`);
	}

	const bytes = fromBase32(input.slice(1));
	return decode(bytes);
};

export const toString = (cid: Cid): string => {
	const encoded = toBase32(cid.bytes);
	return `b${encoded}`;
};

export const fromBinary = (input: Uint8Array): Cid => {
	// 4 bytes + 1 byte for the 0x00 prefix
	// 36 bytes + 1 byte for the 0x00 prefix
	if (input.length !== 37 && input.length !== 5) {
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
