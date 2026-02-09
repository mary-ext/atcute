import { assertType, isCompressedPoint } from './utils.ts';

// NIST SP 800-186, § 3.2.1.3. P-256 -- https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-186.pdf
export const P256_P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;
export const P256_A = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn;
export const P256_B = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn;
export const P256_N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;

const P256_P_PLUS_ONE_OVER_4 = (P256_P + 1n) / 4n;

const BEu8toBigInt = (buf: Uint8Array): bigint => {
	return buf.reduce((a, n, i) => a + (BigInt(n) << BigInt(8 * (buf.length - i - 1))), 0n);
};

const BigIntToBEu8 = (n: bigint, length: number): Uint8Array<ArrayBuffer> => {
	return Uint8Array.from(
		Array.from({ length }, (_, i) => Number(BigInt.asUintN(8, n >> BigInt((length - i - 1) * 8)))),
	);
};

const pow16mod = (a: bigint, n: bigint): bigint => {
	a = (a * a) % n;
	a = (a * a) % n;
	a = (a * a) % n;
	a = (a * a) % n;
	return a;
};

const powmod = (a: bigint, b: bigint, n: bigint): bigint => {
	const a_lut = [1n];
	for (let i = 0; i < 15; i++) {
		a_lut.push((a_lut[i] * a) % n);
	}

	return Array.from(b.toString(16)).reduce((acc, bi) => (pow16mod(acc, n) * a_lut[parseInt(bi, 16)]) % n, 1n);
};

// https://gist.github.com/DavidBuchanan314/4f357c7d8247d744a0b19adbc5a01dbb
export const uncompressP256Point = (coords: Uint8Array): Uint8Array<ArrayBuffer> => {
	assertType(isCompressedPoint(coords), `not a compressed point`);
	assertType(coords.length === 33, `invalid compressed point length`);

	const x = BEu8toBigInt(coords.subarray(1));
	const y_squared = (x ** 3n + P256_A * x + P256_B) % P256_P;

	let y = powmod(y_squared, P256_P_PLUS_ONE_OVER_4, P256_P);

	assertType((y * y) % P256_P === y_squared, `invalid curve point`);

	if ((coords[0] ^ Number(BigInt.asUintN(1, y))) & 1) {
		y = P256_P - y;
	}

	const res = new Uint8Array(1 + 32 + 32);
	res[0] = 4;
	res.set(BigIntToBEu8(x, 32), 1);
	res.set(BigIntToBEu8(y, 32), 1 + 32);

	return res;
};
