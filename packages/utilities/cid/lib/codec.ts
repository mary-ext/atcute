import { fromBase32, toBase32 } from '@atcute/multibase';
import { allocUnsafe, toSha256, equals as isBufferEqual } from '@atcute/uint8array';

/** CID version, always `1` for CIDv1 */
export const CID_VERSION = 1;
/** multicodec for SHA-256 hash */
export const HASH_SHA256 = 0x12;

/** multicodec for raw binary data */
export const CODEC_RAW = 0x55;
/** multicodec for DAG-CBOR encoded data */
export const CODEC_DCBOR = 0x71;

/**
 * represents a Content Identifier (CID), in particular, a limited subset of
 * CIDv1 as described by DASL specifications.
 * https://dasl.ing/cid.html
 */
export interface Cid {
	/** CID version, this is always `1` for CIDv1 */
	readonly version: number;
	/** Multicodec type for the data, can be `0x55` for raw data or `0x71` for DAG-CBOR */
	readonly codec: number;
	/** Digest contents */
	readonly digest: {
		/** Multicodec type for the digest, this is always `0x12` for SHA-256 */
		readonly codec: number;
		/** Raw hash bytes */
		readonly contents: Uint8Array;
	};
	/** Raw CID bytes */
	readonly bytes: Uint8Array;
}

// a SHA-256 CIDv1 is always going to be 36 bytes, that's 4 bytes for the
// header, and 32 bytes for the digest itself.

/**
 * creates a CID from a pre-computed SHA-256 digest
 * @param codec multicodec type for the data
 * @param digest raw SHA-256 hash bytes (must be 32 bytes)
 * @returns CID object
 */
export const fromDigest = (codec: 0x55 | 0x71, digest: Uint8Array): Cid => {
	if (digest.length !== 32) {
		throw new RangeError(`invalid digest length`);
	}

	const bytes = allocUnsafe(4 + 32);

	bytes[0] = CID_VERSION;
	bytes[1] = codec;
	bytes[2] = HASH_SHA256;
	bytes[3] = 32;

	bytes.set(digest, 4);

	return {
		version: CID_VERSION,
		codec: codec,
		digest: {
			codec: HASH_SHA256,
			contents: bytes.subarray(4, 36),
		},
		bytes: bytes,
	};
};

/**
 * creates a CID by hashing the provided data with SHA-256
 * @param codec multicodec type for the data
 * @param data raw data to hash
 * @returns CID object
 */
export const create = async (codec: 0x55 | 0x71, data: Uint8Array): Promise<Cid> => {
	const digest = await toSha256(data);
	return fromDigest(codec, digest);
};

/**
 * decodes a CID from bytes, returning the CID and any remaining bytes
 * @param bytes raw CID bytes
 * @returns tuple of decoded CID and remainder bytes
 * @throws {RangeError} if the bytes are too short or contain invalid values
 */
export const decodeFirst = (bytes: Uint8Array): [decoded: Cid, remainder: Uint8Array] => {
	if (bytes.length < 36) {
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

	if (digestSize !== 32) {
		throw new RangeError(`incorrect cid digest size (got ${digestSize})`);
	}

	const cid: Cid = {
		version: CID_VERSION,
		codec: codec,
		digest: {
			codec: digestType,
			contents: bytes.subarray(4, 36),
		},
		bytes: bytes.subarray(0, 36),
	};

	return [cid, bytes.subarray(36)];
};

/**
 * decodes a CID from bytes, expecting no remainder
 * @param bytes raw CID bytes
 * @returns decoded CID
 * @throws {RangeError} if the bytes are invalid or contain extra data
 */
export const decode = (bytes: Uint8Array): Cid => {
	const [cid, remainder] = decodeFirst(bytes);

	if (remainder.length !== 0) {
		throw new RangeError(`cid bytes includes remainder`);
	}

	return cid;
};

/**
 * parses a CID from a multibase base32 string
 * @param input base32-encoded CID string (with 'b' prefix)
 * @returns decoded CID
 * @throws {SyntaxError} if the string is not a valid multibase base32 string
 * @throws {RangeError} if the string length is invalid
 */
export const fromString = (input: string): Cid => {
	// 36 bytes in base32 = 58 characters + 1 character for the prefix
	if (input.length !== 59 || input[0] !== 'b') {
		throw new SyntaxError(`not a valid cid string`);
	}

	const bytes = fromBase32(input.slice(1));
	return decode(bytes);
};

/**
 * encodes a CID to a multibase base32 string
 * @param cid CID to encode
 * @returns base32-encoded string with 'b' prefix
 */
export const toString = (cid: Cid): string => {
	return `b${toBase32(cid.bytes)}`;
};

/**
 * parses a CID from binary format (with 0x00 prefix)
 * @param input binary CID bytes with 0x00 prefix
 * @returns decoded CID
 * @throws {RangeError} if the byte length is invalid
 * @throws {SyntaxError} if the prefix byte is not 0x00
 */
export const fromBinary = (input: Uint8Array): Cid => {
	// 36 bytes + 1 byte for the 0x00 prefix
	if (input.length !== 37 || input[0] !== 0) {
		throw new SyntaxError(`invalid binary cid`);
	}

	return decode(input.subarray(1));
};

/**
 * encodes a CID to binary format (with 0x00 prefix)
 * @param cid CID to encode
 * @returns binary CID bytes with 0x00 prefix
 */
export const toBinary = (cid: Cid): Uint8Array => {
	const bytes = allocUnsafe(1 + cid.bytes.length);
	bytes[0] = 0;
	bytes.set(cid.bytes, 1);

	return bytes;
};

/**
 * checks if two CIDs are equal
 * @param a first CID
 * @param b second CID
 * @returns true if the CIDs have identical bytes
 */
export const equals = (a: Cid, b: Cid): boolean => {
	return isBufferEqual(a.bytes, b.bytes);
};
