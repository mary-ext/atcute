import { allocUnsafe, decodeUtf8From } from '@atcute/uint8array';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

// #region encode

// charCode lookup table: _encLut[i] = ALPHABET.charCodeAt(i) for i in 0..31
const _encLut: Uint8Array = /*#__PURE__*/ (() => {
	const t = new Uint8Array(32);
	for (let i = 0; i < 32; i++) {
		t[i] = ALPHABET.charCodeAt(i);
	}
	return t;
})();

// output length for a given remainder (0-4 trailing bytes after full 5-byte groups)
const _remOutLen = [0, 2, 4, 5, 7];

/**
 * encodes a Uint8Array to an unpadded RFC 4648 base32 (lowercase) string
 * @param bytes source buffer
 * @returns base32 encoded string
 */
export const toBase32 = (bytes: Uint8Array): string => {
	const len = bytes.length;
	const full = (len / 5) | 0;
	const rem = len - full * 5;
	const outLen = full * 8 + _remOutLen[rem];
	const out = allocUnsafe(outLen);
	const cc = _encLut;

	// process 5-byte groups (= 40 bits = 8 base32 characters each)
	let ip = 0;
	let op = 0;
	for (let g = 0; g < full; g++) {
		const b0 = bytes[ip++];
		const b1 = bytes[ip++];
		const b2 = bytes[ip++];
		const b3 = bytes[ip++];
		const b4 = bytes[ip++];

		out[op++] = cc[b0 >>> 3];
		out[op++] = cc[((b0 << 2) | (b1 >>> 6)) & 0x1f];
		out[op++] = cc[(b1 >>> 1) & 0x1f];
		out[op++] = cc[((b1 << 4) | (b2 >>> 4)) & 0x1f];
		out[op++] = cc[((b2 << 1) | (b3 >>> 7)) & 0x1f];
		out[op++] = cc[(b3 >>> 2) & 0x1f];
		out[op++] = cc[((b3 << 3) | (b4 >>> 5)) & 0x1f];
		out[op++] = cc[b4 & 0x1f];
	}

	// handle remaining 1-4 bytes
	if (rem > 0) {
		let buffer = 0;
		let bits = 0;
		for (let i = ip; i < len; i++) {
			buffer = (buffer << 8) | bytes[i];
			bits += 8;
		}
		while (bits > 0) {
			if (bits >= 5) {
				bits -= 5;
				out[op++] = cc[(buffer >>> bits) & 0x1f];
			} else {
				out[op++] = cc[(buffer << (5 - bits)) & 0x1f];
				bits = 0;
			}
		}
	}

	return decodeUtf8From(out);
};

// #endregion

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
