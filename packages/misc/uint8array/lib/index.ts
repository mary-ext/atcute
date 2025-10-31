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

const fromCharCode = String.fromCharCode;

const shortStringInJS = (buffer: Uint8Array, idx: number, length: number): string | undefined => {
	if (length < 4) {
		if (length < 2) {
			if (length === 0) {
				return '';
			} else {
				const a = buffer[idx];

				if (a & 0x80) {
					return;
				}

				return fromCharCode(a);
			}
		} else {
			const a = buffer[idx];
			const b = buffer[idx + 1];

			if (a & 0x80 || b & 0x80) {
				return;
			}

			if (length < 3) {
				return fromCharCode(a, b);
			}

			const c = buffer[idx + 2];

			if (c & 0x80) {
				return;
			}

			return fromCharCode(a, b, c);
		}
	} else {
		const a = buffer[idx];
		const b = buffer[idx + 1];
		const c = buffer[idx + 2];
		const d = buffer[idx + 3];

		if (a & 0x80 || b & 0x80 || c & 0x80 || d & 0x80) {
			return;
		}

		if (length < 6) {
			if (length === 4) {
				return fromCharCode(a, b, c, d);
			} else {
				const e = buffer[idx + 4];

				if (e & 0x80) {
					return;
				}

				return fromCharCode(a, b, c, d, e);
			}
		} else if (length < 8) {
			const e = buffer[idx + 4];
			const f = buffer[idx + 5];

			if (e & 0x80 || f & 0x80) {
				return;
			}

			if (length < 7) {
				return fromCharCode(a, b, c, d, e, f);
			}

			const g = buffer[idx + 6];

			if (g & 0x80) {
				return;
			}

			return fromCharCode(a, b, c, d, e, f, g);
		} else {
			const e = buffer[idx + 4];
			const f = buffer[idx + 5];
			const g = buffer[idx + 6];
			const h = buffer[idx + 7];

			if (e & 0x80 || f & 0x80 || g & 0x80 || h & 0x80) {
				return;
			}

			if (length < 10) {
				if (length === 8) {
					return fromCharCode(a, b, c, d, e, f, g, h);
				} else {
					const i = buffer[idx + 8];

					if (i & 0x80) {
						return;
					}

					return fromCharCode(a, b, c, d, e, f, g, h, i);
				}
			} else if (length < 12) {
				const i = buffer[idx + 8];
				const j = buffer[idx + 9];

				if (i & 0x80 || j & 0x80) {
					return;
				}

				if (length < 11) {
					return fromCharCode(a, b, c, d, e, f, g, h, i, j);
				}

				const k = buffer[idx + 10];

				if (k & 0x80) {
					return;
				}

				return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
			} else {
				const i = buffer[idx + 8];
				const j = buffer[idx + 9];
				const k = buffer[idx + 10];
				const l = buffer[idx + 11];

				if (i & 0x80 || j & 0x80 || k & 0x80 || l & 0x80) {
					return;
				}

				if (length < 14) {
					if (length === 12) {
						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
					} else {
						const m = buffer[idx + 12];

						if (m & 0x80) {
							return;
						}

						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
					}
				} else {
					const m = buffer[idx + 12];
					const n = buffer[idx + 13];

					if (m & 0x80 || n & 0x80) {
						return;
					}

					if (length < 15) {
						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
					}

					const o = buffer[idx + 14];

					if (o & 0x80) {
						return;
					}

					return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
				}
			}
		}
	}
};

const longStringInJS = (buffer: Uint8Array, idx: number, length: number): string | undefined => {
	const bytes = new Array(length);

	for (let i = 0; i < length; i++) {
		const byte = buffer[idx + i];
		if (byte & 0x80) {
			return;
		}
		bytes[i] = byte;
	}

	return fromCharCode.apply(String, bytes);
};

/**
 * decodes a UTF-8 string from a given buffer
 */
export const decodeUtf8From = (
	from: Uint8Array,
	offset: number = 0,
	length: number = from.length - offset,
): string => {
	if (length < 16) {
		const result = shortStringInJS(from, offset, length);
		if (result !== undefined) {
			return result;
		}
	}

	if (length < 32) {
		const result = longStringInJS(from, offset, length);
		if (result !== undefined) {
			return result;
		}
	}

	const end = offset + length;

	if (length >= 64) {
		return textDecoder.decode(from.subarray(offset, end));
	}

	let str = '';
	let i = offset;

	for (; i + 3 < end; i += 4) {
		const a = from[i];
		const b = from[i + 1];
		const c = from[i + 2];
		const d = from[i + 3];

		if ((a | b | c | d) & 0x80) {
			return str + textDecoder.decode(from.subarray(i, end));
		}

		str += fromCharCode(a, b, c, d);
	}

	for (; i < end; i++) {
		const x = from[i];

		if (x & 0x80) {
			return str + textDecoder.decode(from.subarray(i, end));
		}

		str += fromCharCode(x);
	}

	return str;
};

/**
 * get a SHA-256 digest of this buffer
 */
export const toSha256 = async (buffer: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> => {
	return new Uint8Array(await subtle.digest('SHA-256', buffer));
};
