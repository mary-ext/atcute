// synchronous SHA-256 (FIPS 180-4) avoids WebCrypto call overhead for small inputs

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

const H = new Int32Array(8);
// message schedule, kept as a 16-word ring since each round only looks 16 words back
const W = new Int32Array(16);
// the final one or two blocks, holding the message tail and its padding
const TAIL = new Uint8Array(128);

const compress = (buf: Uint8Array, offset: number): void => {
	let a = H[0];
	let b = H[1];
	let c = H[2];
	let d = H[3];
	let e = H[4];
	let f = H[5];
	let g = H[6];
	let h = H[7];

	for (let i = 0; i < 64; i++) {
		let w: number;

		if (i < 16) {
			const p = offset + (i << 2);
			w = (buf[p] << 24) | (buf[p + 1] << 16) | (buf[p + 2] << 8) | buf[p + 3];
		} else {
			const x = W[(i - 15) & 15];
			const y = W[(i - 2) & 15];

			const s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
			const s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);

			w = (s1 + W[(i - 7) & 15] + s0 + W[i & 15]) | 0;
		}

		W[i & 15] = w;

		const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
		const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);

		// Ch and Maj, rewritten with fewer operations than their FIPS 180-4 definitions
		const t1 = (h + S1 + (g ^ (e & (f ^ g))) + K[i] + w) | 0;
		const t2 = (S0 + ((a & b) | (c & (a | b)))) | 0;

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
};

/**
 * computes the SHA-256 digest of a buffer synchronously
 *
 * @param data message bytes
 * @returns the 32-byte digest
 */
export const toSha256Sync = (data: Uint8Array): Uint8Array<ArrayBuffer> => {
	const len = data.length;
	const full = len & ~63;

	H.set(IV);

	// whole blocks are read in place, only the tail is copied out for padding
	for (let offset = 0; offset < full; offset += 64) {
		compress(data, offset);
	}

	// tail, 0x80 terminator and 64-bit bit length, which spills into a second block past 55 bytes
	const rem = len - full;
	const size = rem < 56 ? 64 : 128;

	// avoid allocating a subarray view for the tail
	for (let i = 0; i < rem; i++) {
		TAIL[i] = data[full + i];
	}

	TAIL[rem] = 0x80;
	for (let i = rem + 1; i < size; i++) {
		TAIL[i] = 0;
	}

	// bit length as a big-endian u64. the upper word's low byte covers messages up to 2^37 bytes
	TAIL[size - 5] = len / 0x20000000;
	TAIL[size - 4] = len >>> 21;
	TAIL[size - 3] = len >>> 13;
	TAIL[size - 2] = len >>> 5;
	TAIL[size - 1] = len << 3;

	compress(TAIL, 0);
	if (size === 128) {
		compress(TAIL, 64);
	}

	const digest = new Uint8Array(32);
	for (let i = 0; i < 8; i++) {
		const word = H[i];
		const p = i << 2;

		digest[p] = word >>> 24;
		digest[p + 1] = word >>> 16;
		digest[p + 2] = word >>> 8;
		digest[p + 3] = word;
	}

	return digest;
};
