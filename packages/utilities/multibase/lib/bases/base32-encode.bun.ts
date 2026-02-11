const ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

// 2-character lookup table: _lut2[(i << 5) | j] = alphabet[i] + alphabet[j]
// JSC (Bun) optimizes string concatenation from pre-built fragments significantly
// better than String.fromCharCode calls
const _lut2: string[] = /*#__PURE__*/ (() => {
	const t: string[] = Array.from({ length: 1024 });
	for (let i = 0; i < 32; i++) {
		for (let j = 0; j < 32; j++) {
			t[(i << 5) | j] = ALPHABET[i] + ALPHABET[j];
		}
	}
	return t;
})();

/**
 * encodes a Uint8Array to an unpadded RFC 4648 base32 (lowercase) string
 * @param bytes source buffer
 * @returns base32 encoded string
 */
export const toBase32 = (bytes: Uint8Array): string => {
	const len = bytes.length;
	let str = '';

	// process 5-byte groups (= 40 bits = 8 base32 characters each),
	// using the 2-char lookup table to emit pairs of characters at a time
	let i = 0;
	const fullGroups = len - (len % 5);
	for (; i < fullGroups; i += 5) {
		const b0 = bytes[i];
		const b1 = bytes[i + 1];
		const b2 = bytes[i + 2];
		const b3 = bytes[i + 3];
		const b4 = bytes[i + 4];

		str +=
			_lut2[((b0 >>> 3) << 5) | (((b0 << 2) | (b1 >>> 6)) & 0x1f)] +
			_lut2[(((b1 >>> 1) & 0x1f) << 5) | (((b1 << 4) | (b2 >>> 4)) & 0x1f)] +
			_lut2[((((b2 << 1) | (b3 >>> 7)) & 0x1f) << 5) | ((b3 >>> 2) & 0x1f)] +
			_lut2[((((b3 << 3) | (b4 >>> 5)) & 0x1f) << 5) | (b4 & 0x1f)];
	}

	// handle remaining 1-4 bytes
	if (i < len) {
		let buffer = 0;
		let bits = 0;
		for (; i < len; i++) {
			buffer = (buffer << 8) | bytes[i];
			bits += 8;
		}
		while (bits > 0) {
			if (bits >= 5) {
				bits -= 5;
				str += ALPHABET[(buffer >>> bits) & 0x1f];
			} else {
				str += ALPHABET[(buffer << (5 - bits)) & 0x1f];
				bits = 0;
			}
		}
	}

	return str;
};
