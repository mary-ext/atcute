// oxlint-disable no-underscore-dangle

import { allocUnsafe as _allocUnsafe, concatArrayBuffers as _concat } from 'bun';
import { Buffer as NodeBuffer } from 'node:buffer';
import { hash as _hash, timingSafeEqual as _timingSafeEqual } from 'node:crypto';

const _byteLength = /*#__PURE__*/ (() => NodeBuffer.byteLength)();

const _compare = /*#__PURE__*/ (() => NodeBuffer.prototype.compare)();
const _equals = /*#__PURE__*/ (() => NodeBuffer.prototype.equals)();
const _latin1Slice = /*#__PURE__*/ (() => NodeBuffer.prototype.latin1Slice)();
const _utf8Slice = /*#__PURE__*/ (() => NodeBuffer.prototype.utf8Slice)();

const textEncoder = new TextEncoder();

const toUint8Array = (buffer: NodeBuffer) => {
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const alloc = (size: number): Uint8Array<ArrayBuffer> => {
	return new Uint8Array(size);
};

export const allocUnsafe: (size: number) => Uint8Array<ArrayBuffer> = _allocUnsafe;

export const compare = (a: Uint8Array, b: Uint8Array): number => {
	return _compare.call(a, b);
};

export const equals = (a: Uint8Array, b: Uint8Array): boolean => {
	return _equals.call(a, b);
};

export const timingSafeEquals = (a: Uint8Array, b: Uint8Array): boolean => {
	return _timingSafeEqual(a, b);
};

export const concat = (arrays: Uint8Array[], size?: number): Uint8Array<ArrayBuffer> => {
	// Bun's typings is slightly wrong, *you can* pass `size: undefined` with `asUint8Array: true`
	return _concat(arrays, size as number, true);
};

export const encodeUtf8: (str: string) => Uint8Array<ArrayBuffer> = textEncoder.encode.bind(textEncoder);

export const encodeUtf8Into = (to: Uint8Array, str: string, offset?: number, length?: number): number => {
	let buffer: Uint8Array;

	if (offset === undefined) {
		buffer = to;
	} else if (length === undefined) {
		buffer = to.subarray(offset);
	} else {
		buffer = to.subarray(offset, offset + length);
	}

	const result = textEncoder.encodeInto(str, buffer);

	return result.written;
};

/**
 * decodes a UTF-8 string from a given buffer
 *
 * @param from source buffer
 * @param offset byte offset to start reading from
 * @param length number of bytes to read
 * @returns decoded string
 */
export const decodeUtf8From = (
	from: Uint8Array,
	offset: number = 0,
	length: number = from.length,
): string => {
	if (length <= 24) {
		let acc = 0;
		for (let i = 0; i < length; i++) {
			acc |= from[offset + i];
		}
		if ((acc & 0x80) === 0) {
			return _latin1Slice.call(from, offset, offset + length);
		}
	}

	return _utf8Slice.call(from, offset, offset + length);
};

/**
 * calculates the UTF-8 byte length of a string
 *
 * @param str string to measure
 * @returns byte length when encoded as UTF-8
 */
export const getUtf8Length = (str: string): number => {
	return _byteLength(str, 'utf8');
};

/**
 * checks if a string's UTF-8 byte length is within a given range
 *
 * @param str string to measure
 * @param min minimum byte length (inclusive)
 * @param max maximum byte length (inclusive)
 * @returns true if byte length is within [min, max]
 */
export const isUtf8LengthInRange = (str: string, min: number, max: number): boolean => {
	const len = str.length;

	// fast path: if max possible UTF-8 length is below min, fail
	if (len * 3 < min) {
		return false;
	}

	// fast path: if UTF-16 length satisfies min and max possible satisfies max
	if (len >= min && len * 3 <= max) {
		return true;
	}

	const utf8len = _byteLength(str, 'utf8');
	return utf8len >= min && utf8len <= max;
};

export const toSha256 = async (buffer: Uint8Array): Promise<Uint8Array<ArrayBuffer>> => {
	return toUint8Array(_hash('sha256', buffer, 'buffer')) as Uint8Array<ArrayBuffer>;
};

/**
 * generates cryptographically secure random bytes
 *
 * @param size number of bytes to generate
 * @returns buffer filled with random bytes
 */
export const randomBytes = (size: number): Uint8Array<ArrayBuffer> => {
	return crypto.getRandomValues(new Uint8Array(size));
};
