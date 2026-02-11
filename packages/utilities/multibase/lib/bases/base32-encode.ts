const ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

// charCode lookup table: cc[i] = ALPHABET.charCodeAt(i) for i in 0..31
const _cc: Uint8Array = /*#__PURE__*/ (() => {
	const t = new Uint8Array(32);
	for (let i = 0; i < 32; i++) {
		t[i] = ALPHABET.charCodeAt(i);
	}
	return t;
})();

const _fromCharCode = String.fromCharCode;

/**
 * encodes a Uint8Array to an unpadded RFC 4648 base32 (lowercase) string
 * @param bytes source buffer
 * @returns base32 encoded string
 */
export const toBase32 = (bytes: Uint8Array): string => {
	const len = bytes.length;
	const full = (len / 5) | 0;
	const rem = len - full * 5;
	const cc = _cc;

	let str = '';
	let ip = 0;

	// process pairs of 5-byte groups (10 bytes → 16 base32 chars) at a time,
	// batching into a single String.fromCharCode call for fewer string concats
	const pairs = (full / 2) | 0;
	for (let g = 0; g < pairs; g++) {
		const a0 = bytes[ip],
			a1 = bytes[ip + 1],
			a2 = bytes[ip + 2],
			a3 = bytes[ip + 3],
			a4 = bytes[ip + 4];
		const b0 = bytes[ip + 5],
			b1 = bytes[ip + 6],
			b2 = bytes[ip + 7],
			b3 = bytes[ip + 8],
			b4 = bytes[ip + 9];

		str += _fromCharCode(
			cc[a0 >>> 3],
			cc[((a0 << 2) | (a1 >>> 6)) & 0x1f],
			cc[(a1 >>> 1) & 0x1f],
			cc[((a1 << 4) | (a2 >>> 4)) & 0x1f],
			cc[((a2 << 1) | (a3 >>> 7)) & 0x1f],
			cc[(a3 >>> 2) & 0x1f],
			cc[((a3 << 3) | (a4 >>> 5)) & 0x1f],
			cc[a4 & 0x1f],
			cc[b0 >>> 3],
			cc[((b0 << 2) | (b1 >>> 6)) & 0x1f],
			cc[(b1 >>> 1) & 0x1f],
			cc[((b1 << 4) | (b2 >>> 4)) & 0x1f],
			cc[((b2 << 1) | (b3 >>> 7)) & 0x1f],
			cc[(b3 >>> 2) & 0x1f],
			cc[((b3 << 3) | (b4 >>> 5)) & 0x1f],
			cc[b4 & 0x1f],
		);
		ip += 10;
	}

	// remaining full group if odd count
	if (full & 1) {
		const b0 = bytes[ip],
			b1 = bytes[ip + 1],
			b2 = bytes[ip + 2],
			b3 = bytes[ip + 3],
			b4 = bytes[ip + 4];

		str += _fromCharCode(
			cc[b0 >>> 3],
			cc[((b0 << 2) | (b1 >>> 6)) & 0x1f],
			cc[(b1 >>> 1) & 0x1f],
			cc[((b1 << 4) | (b2 >>> 4)) & 0x1f],
			cc[((b2 << 1) | (b3 >>> 7)) & 0x1f],
			cc[(b3 >>> 2) & 0x1f],
			cc[((b3 << 3) | (b4 >>> 5)) & 0x1f],
			cc[b4 & 0x1f],
		);
		ip += 5;
	}

	// handle remaining 1-4 bytes
	if (rem > 0) {
		let buffer = 0;
		let bits = 0;
		for (let i = ip; i < len; i++) {
			buffer = (buffer << 8) | bytes[i];
			bits += 8;
		}
		while (bits >= 5) {
			bits -= 5;
			str += _fromCharCode(cc[(buffer >>> bits) & 0x1f]);
		}
		if (bits > 0) {
			str += _fromCharCode(cc[(buffer << (5 - bits)) & 0x1f]);
		}
	}

	return str;
};
