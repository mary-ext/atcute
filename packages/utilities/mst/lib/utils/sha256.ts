// synchronous SHA-256 avoids async digest overhead for short MST keys

const rotr = (x: number, n: number): number => {
	return (x >>> n) | (x << (32 - n));
};

const fraction = (x: number): number => {
	return ((x - Math.floor(x)) * 0x100000000) | 0;
};

// round constants and initial hash values are the fractional parts of the cube and square roots of the
// first primes (FIPS 180-4 §4.2.2, §5.3.3). deriving them reduces bundle size.
const [K, IV] = /*#__PURE__*/ (() => {
	const k = new Int32Array(64);
	const iv = new Int32Array(8);

	for (let n = 0, p = 2; n < 64; p++) {
		let prime = true;
		for (let d = 2; d * d <= p; d++) {
			if (p % d === 0) {
				prime = false;
				break;
			}
		}

		if (prime) {
			if (n < 8) {
				iv[n] = fraction(Math.sqrt(p));
			}

			k[n++] = fraction(Math.cbrt(p));
		}
	}

	return [k, iv];
})();

const W = new Int32Array(64);
const H = new Int32Array(8);

// padded message scratch, sized for the longest valid MST key (1024 bytes, padded to 17 blocks)
const SCRATCH = new Uint8Array(1088);

/**
 * computes the SHA-256 digest of a message
 *
 * @param data message bytes
 * @returns the digest as 8 big-endian words, in a buffer that is overwritten by the next call
 */
export const sha256 = (data: Uint8Array): Int32Array => {
	const len = data.length;
	// message, 0x80 terminator and 64-bit bit length, rounded up to whole 64-byte blocks
	const size = (len + 72) & ~63;

	const buf = size <= SCRATCH.length ? SCRATCH : new Uint8Array(size);

	buf.set(data);
	buf[len] = 0x80;
	buf.fill(0, len + 1, size);

	// bit length as a big-endian u64. the upper word's low byte covers messages up to 2^37 bytes
	buf[size - 5] = len / 0x20000000;
	buf[size - 4] = len >>> 21;
	buf[size - 3] = len >>> 13;
	buf[size - 2] = len >>> 5;
	buf[size - 1] = len << 3;

	H.set(IV);

	for (let offset = 0; offset < size; offset += 64) {
		for (let i = 0; i < 16; i++) {
			const p = offset + i * 4;
			W[i] = (buf[p] << 24) | (buf[p + 1] << 16) | (buf[p + 2] << 8) | buf[p + 3];
		}

		for (let i = 16; i < 64; i++) {
			const x = W[i - 15];
			const y = W[i - 2];

			const s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
			const s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);

			W[i] = (s1 + W[i - 7] + s0 + W[i - 16]) | 0;
		}

		let a = H[0];
		let b = H[1];
		let c = H[2];
		let d = H[3];
		let e = H[4];
		let f = H[5];
		let g = H[6];
		let h = H[7];

		for (let i = 0; i < 64; i++) {
			const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
			const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);

			const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
			const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;

			h = g;
			g = f;
			f = e;
			e = (d + t1) | 0;
			d = c;
			c = b;
			b = a;
			a = (t1 + t2) | 0;
		}

		H[0] += a;
		H[1] += b;
		H[2] += c;
		H[3] += d;
		H[4] += e;
		H[5] += f;
		H[6] += g;
		H[7] += h;
	}

	return H;
};
