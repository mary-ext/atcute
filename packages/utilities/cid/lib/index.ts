/**
 * @module
 * Bare minimum implementation for creating, parsing, and formatting
 * AT Protocol-blessed CIDv1 format.
 *
 * As specified by AT Protocol, the blessed format is:
 * - Multibase: `base32` (b)
 * - Multicodec: `dag-cbor` (0x71) for record, `raw` (0x55) for blobs
 * - Multihash: `sha-256` (0x12)
 */

import * as base32 from '@atcute/base32';
import * as varint from '@atcute/varint';

/**
 * Raw digest information
 */
export interface Digest {
	code: number;
	size: number;
	digest: Uint8Array;
	bytes: Uint8Array;
}

/**
 * CID information
 */
export interface CID {
	version: number;
	code: number;
	digest: Digest;
	bytes: Uint8Array;
}

/**
 * Information regarding CID buffer being inspected
 */
export interface InspectedCID {
	version: number;
	codec: number;
	multihashCode: number;
	digestSize: number;
	multihashSize: number;
	size: number;
}

/**
 * Parse a CID string
 */
export const parse = (cid: string): CID => {
	if (cid[0] !== 'b') {
		throw new Error(`only base32 cidv1 is supported`);
	}

	const bytes = base32.decode(cid.slice(1));
	return decode(bytes);
};

/**
 * Provides information regarding the CID buffer
 */
export const inspect = (initialBytes: Uint8Array): InspectedCID => {
	let offset = 0;
	const next = (): number => {
		const [i, length] = varint.decode(initialBytes.subarray(offset));
		offset += length;
		return i;
	};

	let version = next();
	let codec = 0x70; // dag-pb
	if ((version as number) === 18) {
		// CIDv0
		version = 0;
		offset = 0;
	} else {
		codec = next();
	}

	if (version !== 1) {
		throw new RangeError(`only cidv1 is supported`);
	}

	const prefixSize = offset;
	const multihashCode = next();
	const digestSize = next();
	const size = offset + digestSize;
	const multihashSize = size - prefixSize;

	return { version, codec, multihashCode, digestSize, multihashSize, size };
};

/**
 * Decode the first CID contained, and return the remainder.
 * @param bytes Buffer to decode
 * @returns A tuple containing the first CID in the buffer, and the remainder
 */
export const decodeFirst = (bytes: Uint8Array): [cid: CID, remainder: Uint8Array] => {
	const specs = inspect(bytes);
	const prefixSize = specs.size - specs.multihashSize;
	const multihashBytes = bytes.subarray(prefixSize, prefixSize + specs.multihashSize);

	if (multihashBytes.byteLength !== specs.multihashSize) {
		throw new RangeError('incorrect cid length');
	}

	const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);

	const digest: Digest = {
		code: specs.multihashCode,
		size: specs.multihashSize,
		digest: digestBytes,
		bytes: multihashBytes,
	};

	const cid: CID = {
		version: 1,
		code: specs.codec,
		digest: digest,
		bytes: bytes.subarray(0, specs.size),
	};

	return [cid, bytes.subarray(specs.size)];
};

/**
 * Decodes a CID buffer
 */
export const decode = (bytes: Uint8Array): CID => {
	const [cid, remainder] = decodeFirst(bytes);

	if (remainder.length !== 0) {
		throw new Error(`incorrect cid length`);
	}

	return cid;
};

/**
 * Creates a CID
 */
export const create = async (code: number, input: Uint8Array): Promise<CID> => {
	const digest = createDigest(0x12, new Uint8Array(await crypto.subtle.digest('sha-256', input)));
	const bytes = encode(1, code, digest.bytes);

	return {
		version: 1,
		code: code,
		digest: digest,
		bytes: bytes,
	};
};

/**
 * Serialize CID into a string
 */
export const format = (cid: CID): string => {
	return 'b' + base32.encode(cid.bytes);
};

export const createDigest = (code: number, digest: Uint8Array): Digest => {
	const size = digest.byteLength;
	const sizeOffset = varint.encodingLength(code);
	const digestOffset = sizeOffset + varint.encodingLength(size);

	const bytes = new Uint8Array(digestOffset + size);
	varint.encode(code, bytes, 0);
	varint.encode(size, bytes, sizeOffset);
	bytes.set(digest, digestOffset);

	return {
		code: code,
		size: size,
		digest: digest,
		bytes: bytes,
	};
};

export const encode = (version: number, code: number, multihash: Uint8Array): Uint8Array => {
	const codeOffset = varint.encodingLength(version);
	const hashOffset = codeOffset + varint.encodingLength(code);

	const bytes = new Uint8Array(hashOffset + multihash.byteLength);
	varint.encode(version, bytes, 0);
	varint.encode(code, bytes, codeOffset);
	bytes.set(multihash, hashOffset);

	return bytes;
};
