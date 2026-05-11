// oxlint-disable no-underscore-dangle

import { Buffer as NodeBuffer } from 'node:buffer';
import {
	hash as _hash,
	randomFillSync as _randomFillSync,
	timingSafeEqual as _timingSafeEqual,
} from 'node:crypto';

const _alloc = /*#__PURE__*/ (() => NodeBuffer.alloc)();
const _allocUnsafe = /*#__PURE__*/ (() => NodeBuffer.allocUnsafe)();
const _concat = /*#__PURE__*/ (() => NodeBuffer.concat)();
const _from = /*#__PURE__*/ (() => NodeBuffer.from)();

const _byteLength = /*#__PURE__*/ (() => NodeBuffer.byteLength)();

const _compare = /*#__PURE__*/ (() => NodeBuffer.prototype.compare)();
const _equals = /*#__PURE__*/ (() => NodeBuffer.prototype.equals)();
const _utf8Slice = /*#__PURE__*/ (() => NodeBuffer.prototype.utf8Slice)();
const _utf8Write = /*#__PURE__*/ (() => NodeBuffer.prototype.utf8Write)();

const toUint8Array = (buffer: NodeBuffer) => {
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const alloc = (size: number): Uint8Array<ArrayBuffer> => {
	return toUint8Array(_alloc(size)) as Uint8Array<ArrayBuffer>;
};

export const allocUnsafe = (size: number): Uint8Array<ArrayBuffer> => {
	return toUint8Array(_allocUnsafe(size)) as Uint8Array<ArrayBuffer>;
};

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
	return toUint8Array(_concat(arrays, size)) as Uint8Array<ArrayBuffer>;
};

export const encodeUtf8 = (str: string): Uint8Array<ArrayBuffer> => {
	return toUint8Array(_from(str, 'utf8')) as Uint8Array<ArrayBuffer>;
};

export const encodeUtf8Into = (to: Uint8Array, str: string, offset?: number, length?: number): number => {
	return _utf8Write.call(to, str, offset, length);
};

const _fromCharCode = String.fromCharCode;

// fully unrolled short string decoder, inspired by cbor-x
// returns null if non-ASCII byte encountered, signaling fallback to utf8Slice
const _shortString = (from: Uint8Array, p: number, length: number): string | null => {
	if (length < 4) {
		if (length < 2) {
			if (length === 0) {
				return '';
			}
			const a = from[p];
			if (a & 0x80) {
				return null;
			}
			return _fromCharCode(a);
		}
		const a = from[p];
		const b = from[p + 1];
		if ((a | b) & 0x80) {
			return null;
		}
		if (length === 2) {
			return _fromCharCode(a, b);
		}
		const c = from[p + 2];
		if (c & 0x80) {
			return null;
		}
		return _fromCharCode(a, b, c);
	}
	const a = from[p];
	const b = from[p + 1];
	const c = from[p + 2];
	const d = from[p + 3];
	if ((a | b | c | d) & 0x80) {
		return null;
	}
	if (length < 8) {
		if (length === 4) {
			return _fromCharCode(a, b, c, d);
		}
		const e = from[p + 4];
		if (e & 0x80) {
			return null;
		}
		if (length === 5) {
			return _fromCharCode(a, b, c, d, e);
		}
		const f = from[p + 5];
		if (f & 0x80) {
			return null;
		}
		if (length === 6) {
			return _fromCharCode(a, b, c, d, e, f);
		}
		const g = from[p + 6];
		if (g & 0x80) {
			return null;
		}
		return _fromCharCode(a, b, c, d, e, f, g);
	}
	const e = from[p + 4];
	const f = from[p + 5];
	const g = from[p + 6];
	const h = from[p + 7];
	if ((e | f | g | h) & 0x80) {
		return null;
	}
	if (length < 12) {
		if (length === 8) {
			return _fromCharCode(a, b, c, d, e, f, g, h);
		}
		const i = from[p + 8];
		if (i & 0x80) {
			return null;
		}
		if (length === 9) {
			return _fromCharCode(a, b, c, d, e, f, g, h, i);
		}
		const j = from[p + 9];
		if (j & 0x80) {
			return null;
		}
		if (length === 10) {
			return _fromCharCode(a, b, c, d, e, f, g, h, i, j);
		}
		const k = from[p + 10];
		if (k & 0x80) {
			return null;
		}
		return _fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
	}
	const i = from[p + 8];
	const j = from[p + 9];
	const k = from[p + 10];
	const l = from[p + 11];
	if ((i | j | k | l) & 0x80) {
		return null;
	}
	if (length === 12) {
		return _fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
	}
	const m = from[p + 12];
	if (m & 0x80) {
		return null;
	}
	if (length === 13) {
		return _fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
	}
	const n = from[p + 13];
	if (n & 0x80) {
		return null;
	}
	if (length === 14) {
		return _fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
	}
	const o = from[p + 14];
	if (o & 0x80) {
		return null;
	}
	return _fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
};

/**
 * decodes a UTF-8 string from a given buffer
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
	if (length <= 15) {
		const result = _shortString(from, offset, length);
		if (result !== null) {
			return result;
		}
	}
	return _utf8Slice.call(from, offset, offset + length);
};

/**
 * calculates the UTF-8 byte length of a string
 * @param str string to measure
 * @returns byte length when encoded as UTF-8
 */
export const getUtf8Length = (str: string): number => {
	return _byteLength(str, 'utf8');
};

/**
 * checks if a string's UTF-8 byte length is within a given range
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
 * @param size number of bytes to generate
 * @returns buffer filled with random bytes
 */
export const randomBytes = (size: number): Uint8Array<ArrayBuffer> => {
	return _randomFillSync(toUint8Array(_allocUnsafe(size))) as Uint8Array<ArrayBuffer>;
};
