import { allocUnsafe } from '@atcute/uint8array';

export { toBase32 } from '#bases/base32-encode';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

// #region decode

// charCode -> 5-bit value lookup table, 0xff for invalid characters.
// valid base32 chars: a-z (97-122) map to 0-25, 2-7 (50-55) map to 26-31.
const _decodeLut: Uint8Array = /*#__PURE__*/ (() => {
	const t = new Uint8Array(128).fill(0xff);
	for (let i = 0; i < 32; i++) {
		t[ALPHABET.charCodeAt(i)] = i;
	}
	return t;
})();

/**
 * decodes an unpadded RFC 4648 base32 (lowercase) string to a Uint8Array
 * @param str base32 encoded string
 * @returns decoded buffer
 * @throws {SyntaxError} on invalid characters or malformed trailing bits
 */
export const fromBase32 = (str: string): Uint8Array<ArrayBuffer> => {
	const end = str.length;
	const bytes = allocUnsafe(((end * 5) / 8) | 0);

	let written = 0;
	let i = 0;

	// process 8-character groups (= 40 bits = 5 bytes each)
	const fullGroups = end - (end % 8);
	for (; i < fullGroups; i += 8) {
		const c0 = _decodeLut[str.charCodeAt(i)];
		const c1 = _decodeLut[str.charCodeAt(i + 1)];
		const c2 = _decodeLut[str.charCodeAt(i + 2)];
		const c3 = _decodeLut[str.charCodeAt(i + 3)];
		const c4 = _decodeLut[str.charCodeAt(i + 4)];
		const c5 = _decodeLut[str.charCodeAt(i + 5)];
		const c6 = _decodeLut[str.charCodeAt(i + 6)];
		const c7 = _decodeLut[str.charCodeAt(i + 7)];

		// valid base32 values are 0-31 (5 bits), so any value with bits
		// outside the low 5 means 0xff was in the mix
		if ((c0 | c1 | c2 | c3 | c4 | c5 | c6 | c7) & 0xe0) {
			throw new SyntaxError(`invalid base string`);
		}

		bytes[written] = (c0 << 3) | (c1 >>> 2);
		bytes[written + 1] = ((c1 << 6) | (c2 << 1) | (c3 >>> 4)) & 0xff;
		bytes[written + 2] = ((c3 << 4) | (c4 >>> 1)) & 0xff;
		bytes[written + 3] = ((c4 << 7) | (c5 << 2) | (c6 >>> 3)) & 0xff;
		bytes[written + 4] = ((c6 << 5) | c7) & 0xff;
		written += 5;
	}

	// handle remaining 1-7 characters
	if (i < end) {
		let bits = 0;
		let buffer = 0;
		for (; i < end; ++i) {
			const value = _decodeLut[str.charCodeAt(i)];
			if (value & 0xe0) {
				throw new SyntaxError(`invalid base string`);
			}
			buffer = (buffer << 5) | value;
			bits += 5;
			if (bits >= 8) {
				bits -= 8;
				bytes[written++] = 0xff & (buffer >> bits);
			}
		}

		if (bits >= 5 || (0xff & (buffer << (8 - bits))) !== 0) {
			throw new SyntaxError(`unexpected end of data`);
		}
	}

	return bytes;
};

// #endregion
