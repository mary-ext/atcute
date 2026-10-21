import { toSha256Sync } from './sha256.ts';

const textEncoder = new TextEncoder();
// `ignoreBOM: true` keeps a leading U+FEFF as a regular character instead of
// stripping it, matching the node/bun `utf8Slice` fallback (CBOR text strings
// are arbitrary and a leading BOM is a legitimate character)
const textDecoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

const subtle = crypto.subtle;

/** creates an Uint8Array of the requested size, with the contents zeroed */
export const alloc = (size: number): Uint8Array<ArrayBuffer> => {
	return new Uint8Array(size);
};

/**
 * creates an Uint8Array of the requested size, where the contents may not be zeroed out. only use if you're
 * certain that the contents will be overwritten
 */
export const allocUnsafe = alloc;

/**
 * compares two Uint8Array buffers bytewise
 *
 * @param a first buffer
 * @param b second buffer
 * @returns -1 if `a` sorts before `b`, 1 if it sorts after, 0 if they hold the same bytes
 */
export const compare = (a: Uint8Array, b: Uint8Array): number => {
	const alen = a.length;
	const blen = b.length;
	const len = alen < blen ? alen : blen;

	for (let i = 0; i < len; i++) {
		const ax = a[i]!;
		const bx = b[i]!;

		if (ax < bx) {
			return -1;
		}

		if (ax > bx) {
			return 1;
		}
	}

	if (alen < blen) {
		return -1;
	}

	if (alen > blen) {
		return 1;
	}

	return 0;
};

/** checks if the two Uint8Array buffers are equal */
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
 *
 * @param a first buffer
 * @param b second buffer
 * @returns whether the buffers hold the same bytes; false if their lengths differ
 */
export const timingSafeEquals = (a: Uint8Array, b: Uint8Array): boolean => {
	let len: number;
	let out = 0;
	if ((len = a.length) === b.length) {
		while (len--) {
			out |= a[len]! ^ b[len]!;
		}
	}

	return len === -1 && out === 0;
};

/**
 * concatenates multiple Uint8Array buffers into one
 *
 * @param arrays buffers to concatenate
 * @param size exact byte length of the result, defaulting to the combined length of `arrays`. contents
 *   overflowing it are truncated, and any remainder past them is left zeroed
 * @returns buffer holding the concatenated contents
 */
export const concat = (arrays: Uint8Array[], size?: number): Uint8Array<ArrayBuffer> => {
	let written = 0;

	const len = arrays.length;
	let idx: number;

	if (size === undefined) {
		for (idx = size = 0; idx < len; idx++) {
			const chunk = arrays[idx]!;
			size += chunk.length;
		}
	}

	const buffer = new Uint8Array(size);

	for (idx = 0; idx < len; idx++) {
		const chunk = arrays[idx]!;
		const remaining = size - written;

		if (chunk.length > remaining) {
			buffer.set(chunk.subarray(0, remaining), written);
			break;
		}

		buffer.set(chunk, written);
		written += chunk.length;
	}

	return buffer;
};

/** encodes a UTF-8 string */
export const encodeUtf8 = (str: string): Uint8Array<ArrayBuffer> => {
	return textEncoder.encode(str);
};

/** encodes a UTF-8 string into a given buffer */
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

// avoid TextDecoder call overhead for short ASCII strings
const SHORT_STRING_MAX = 32;

const _shortString = (from: Uint8Array, offset: number, length: number): string | null => {
	// JavaScriptCore's `apply` is slower with push-grown arrays
	// oxlint-disable-next-line unicorn/no-new-array -- `Array.from({ length })` builds a different array kind
	const codes = new Array<number>(length);

	for (let idx = 0; idx < length; idx++) {
		const code = from[offset + idx]!;
		if (code & 0x80) {
			return null;
		}

		codes[idx] = code;
	}

	// oxlint-disable-next-line prefer-spread
	return _fromCharCode.apply(null, codes);
};

/**
 * decodes a UTF-8 string from a given buffer
 *
 * @param from source buffer
 * @param offset byte offset to start reading from
 * @param length number of bytes to read
 * @returns decoded string
 * @throws {TypeError} if the byte range is not well-formed UTF-8
 */
export const decodeUtf8From = (
	from: Uint8Array,
	offset: number = 0,
	length: number = from.length - offset,
): string => {
	if (length <= SHORT_STRING_MAX) {
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

const isLowSurrogate = (code: number): boolean => {
	return code >= 0xdc00 && code <= 0xdfff;
};

/**
 * calculates the UTF-8 byte length of a string
 *
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
		} else if (isLowSurrogate(str.charCodeAt(u16pos + 1))) {
			u16pos += 2;
			u8pos += 4;
		} else {
			// unpaired, substituted with U+FFFD
			u16pos += 1;
			u8pos += 3;
		}
	}

	return u8pos;
};

/**
 * checks if a string's UTF-8 byte length is within a given range. includes early-exit optimization when
 * exceeding max length.
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
		} else if (isLowSurrogate(str.charCodeAt(u16pos + 1))) {
			u16pos += 2;
			u8pos += 4;
		} else {
			// unpaired, substituted with U+FFFD
			u16pos += 1;
			u8pos += 3;
		}

		// early exit once we exceed max
		if (u8pos > max) {
			return false;
		}
	}

	return u8pos >= min;
};

/** get a SHA-256 digest of this buffer */
export const toSha256 = async (buffer: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> => {
	return new Uint8Array(await subtle.digest('SHA-256', buffer));
};

export { toSha256Sync };

/**
 * generates cryptographically secure random bytes
 *
 * @param size number of bytes to generate
 * @returns buffer filled with random bytes
 */
export const randomBytes = (size: number): Uint8Array<ArrayBuffer> => {
	return crypto.getRandomValues(new Uint8Array(size));
};
