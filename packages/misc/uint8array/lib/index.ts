const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const subtle = crypto.subtle;

/**
 * creates an Uint8Array of the requested size, with the contents zeroed
 */
export const alloc = (size: number): Uint8Array<ArrayBuffer> => {
	return new Uint8Array(size);
};

/**
 * creates an Uint8Array of the requested size, where the contents may not be
 * zeroed out. only use if you're certain that the contents will be overwritten
 */
export const allocUnsafe = alloc;

/**
 * compares two Uint8Array buffers
 */
export const compare = (a: Uint8Array, b: Uint8Array): number => {
	const alen = a.length;
	const blen = b.length;

	if (alen > blen) {
		return 1;
	}
	if (alen < blen) {
		return -1;
	}

	for (let i = 0; i < alen; i++) {
		const ax = a[i];
		const bx = b[i];

		if (ax < bx) {
			return -1;
		}

		if (ax > bx) {
			return 1;
		}
	}

	return 0;
};

/**
 * checks if the two Uint8Array buffers are equal
 */
export const equals = (a: Uint8Array, b: Uint8Array): boolean => {
	if (a === b) {
		return true;
	}

	let len: number;
	if ((len = a.length) === b.length) {
		while (len--) {
			if (a[len] !== b[len]) {
				return false;
			}
		}
	}

	return len === -1;
};

/**
 * checks if the two Uint8Array buffers are equal, timing-safe version
 */
export const timingSafeEquals = (a: Uint8Array, b: Uint8Array): boolean => {
	let len: number;
	let out = 0;
	if ((len = a.length) === b.length) {
		while (len--) {
			out |= a[len] ^ b[len];
		}
	}

	return len === -1 && out === 0;
};

/**
 * concatenates multiple Uint8Array buffers into one
 */
export const concat = (arrays: Uint8Array[], size?: number): Uint8Array<ArrayBuffer> => {
	let written = 0;

	let len = arrays.length;
	let idx: number;

	if (size === undefined) {
		for (idx = size = 0; idx < len; idx++) {
			const chunk = arrays[idx];
			size += chunk.length;
		}
	}

	const buffer = new Uint8Array(size);

	for (idx = 0; idx < len; idx++) {
		const chunk = arrays[idx];

		buffer.set(chunk, written);
		written += chunk.length;
	}

	return buffer;
};

/**
 * encodes a UTF-8 string
 */
export const encodeUtf8 = (str: string): Uint8Array<ArrayBuffer> => {
	return textEncoder.encode(str);
};

/**
 * encodes a UTF-8 string into a given buffer
 */
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

const _fromCharCode = String.fromCharCode;

// fully unrolled short string decoder, inspired by cbor-x
// returns null if non-ASCII byte encountered, signaling fallback to TextDecoder
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
	if (offset === 0 && length === from.length) {
		return textDecoder.decode(from);
	}
	return textDecoder.decode(from.subarray(offset, offset + length));
};

/**
 * calculates the UTF-8 byte length of a string
 * @param str string to measure
 * @returns byte length when encoded as UTF-8
 */
export const getUtf8Length = (str: string): number => {
	const len = str.length;

	let u16pos = 0;
	let u8pos = 0;

	// ASCII fast-path: batch process 4 chars at a time
	while (u16pos + 3 < len) {
		const a = str.charCodeAt(u16pos);
		const b = str.charCodeAt(u16pos + 1);
		const c = str.charCodeAt(u16pos + 2);
		const d = str.charCodeAt(u16pos + 3);

		if ((a | b | c | d) >= 0x80) {
			break;
		}

		u16pos += 4;
		u8pos += 4;
	}

	// handle remaining chars
	while (u16pos < len) {
		const code = str.charCodeAt(u16pos);

		if (code < 0x80) {
			u16pos += 1;
			u8pos += 1;
		} else if (code < 0x800) {
			u16pos += 1;
			u8pos += 2;
		} else if (code < 0xd800 || code > 0xdbff) {
			u16pos += 1;
			u8pos += 3;
		} else {
			u16pos += 2;
			u8pos += 4;
		}
	}

	return u8pos;
};

/**
 * checks if a string's UTF-8 byte length is within a given range.
 * includes early-exit optimization when exceeding max length.
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

	let u16pos = 0;
	let u8pos = 0;

	while (u16pos < len) {
		const code = str.charCodeAt(u16pos);

		if (code < 0x80) {
			u16pos += 1;
			u8pos += 1;
		} else if (code < 0x800) {
			u16pos += 1;
			u8pos += 2;
		} else if (code < 0xd800 || code > 0xdbff) {
			u16pos += 1;
			u8pos += 3;
		} else {
			u16pos += 2;
			u8pos += 4;
		}

		// early exit once we exceed max
		if (u8pos > max) {
			return false;
		}
	}

	return u8pos >= min;
};

/**
 * get a SHA-256 digest of this buffer
 */
export const toSha256 = async (buffer: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> => {
	return new Uint8Array(await subtle.digest('SHA-256', buffer));
};

/**
 * generates cryptographically secure random bytes
 * @param size number of bytes to generate
 * @returns buffer filled with random bytes
 */
export const randomBytes = (size: number): Uint8Array<ArrayBuffer> => {
	return crypto.getRandomValues(new Uint8Array(size));
};
