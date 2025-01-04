const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const subtle = crypto.subtle;

/**
 * creates an Uint8Array of the requested size, with the contents zeroed
 */
export const alloc = (size: number): Uint8Array => {
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
export const concat = (arrays: Uint8Array[], size?: number): Uint8Array => {
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
 * encodes a UTF-8 string into the buffer
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

/**
 * decodes a UTF-8 string from a buffer
 */
export const decodeUtf8From = (from: Uint8Array, offset?: number, length?: number): string => {
	let buffer: Uint8Array;

	if (offset === undefined) {
		buffer = from;
	} else if (length === undefined) {
		buffer = from.subarray(offset);
	} else {
		buffer = from.subarray(offset, offset + length);
	}

	const result = textDecoder.decode(buffer);

	return result;
};

/**
 * get a SHA-256 digest of this buffer
 */
export const toSha256 = async (buffer: Uint8Array): Promise<Uint8Array> => {
	return new Uint8Array(await subtle.digest('SHA-256', buffer));
};
