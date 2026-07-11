import { describe, expect, it } from 'vitest';

import { decode, encode, encodingLength } from './index.ts';

function randint(range: number): number {
	return Math.floor(Math.random() * range);
}

it('passes fuzzy test', () => {
	for (let i = 0; i < 500; ++i) {
		const expected = randint(0x7fffffff);

		const encoded = new Uint8Array(10);
		const encodedLength = encode(expected, encoded);

		const { value, nextOffset } = decode(encoded);

		expect(value).toBe(expected);
		expect(nextOffset).toBe(encodedLength);
	}
});

describe('encode', () => {
	it('throws on very large numbers', () => {
		expect(() => encode(2 ** 54 - 1, new Uint8Array(10))).toThrow();
	});

	it('throws on non-integers', () => {
		expect(() => encode(1.9, new Uint8Array(10))).toThrow();
		expect(() => encode(NaN, new Uint8Array(10))).toThrow();
		expect(() => encode(Infinity, new Uint8Array(10))).toThrow();
	});

	it('throws on negative numbers', () => {
		expect(() => encode(-5, new Uint8Array(10))).toThrow();
	});
});

describe('decode', () => {
	it('supports decoding at offset', () => {
		const encoded = new Uint8Array([255, 255, 255]);
		const written = encode(420, encoded, 1);

		const { value, nextOffset } = decode(encoded, 1);

		expect(value).toBe(420);
		expect(nextOffset).toBe(1 + written);
	});

	it('respects length', () => {
		const encoded = new Uint8Array(10);
		encode(16384, encoded);

		expect(() => decode(encoded.subarray(0, 2), 0)).toThrow();
		expect(decode(encoded, 0, 3)).toEqual({ value: 16384, nextOffset: 3 });
	});

	it('round-trips the maximum safe integer', () => {
		const encoded = new Uint8Array(10);
		const written = encode(Number.MAX_SAFE_INTEGER, encoded);

		expect(decode(encoded)).toEqual({ value: Number.MAX_SAFE_INTEGER, nextOffset: written });
	});

	it('throws on values past the maximum safe integer', () => {
		// a 9-byte varint encoding a value beyond 2^53
		const encoded = new Uint8Array([0x81, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x10]);

		expect(() => decode(encoded)).toThrow();
	});
});

describe('encodingLength', () => {
	it('matches encode() outputs', () => {
		const buf = new Uint8Array(10);
		for (let i = 0; i <= 53; i++) {
			const n = 2 ** i - 1;

			expect(encodingLength(n)).toBe(encode(n, buf));
		}
	});
});
