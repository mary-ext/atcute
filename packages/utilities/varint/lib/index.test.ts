import { it, expect, describe } from 'vitest';

import { decode, encode, encodingLength } from './index.ts';

function randint(range: number): number {
	return Math.floor(Math.random() * range);
}

it('passes fuzzy test', () => {
	for (let i = 0; i < 500; ++i) {
		const expected = randint(0x7fffffff);

		const encoded: number[] = [];
		const encodedLength = encode(expected, encoded);

		const { value, nextOffset } = decode(encoded);

		expect(value).toBe(expected);
		expect(nextOffset).toBe(encodedLength);
	}
});

describe('encode', () => {
	it('throws on very large numbers', () => {
		expect(() => encode(2 ** 54 - 1, [])).toThrow();
	});
});

describe('decode', () => {
	it('supports decoding at offset', () => {
		const encoded: number[] = [255, 255, 255];
		const written = encode(420, encoded, 1);

		const { value, nextOffset } = decode(encoded, 1);

		expect(value).toBe(420);
		expect(nextOffset).toBe(1 + written);
	});

	it('respects length', () => {
		const encoded: number[] = [];
		encode(16384, encoded);

		expect(() => decode(encoded, 0, 2)).toThrow();
		expect(decode(encoded, 0, 3)).toEqual({ value: 16384, nextOffset: 3 });
	});
});

describe('encodingLength', () => {
	it('matches encode() outputs', () => {
		for (let i = 0; i <= 53; i++) {
			let n = 2 ** i - 1;

			expect(encodingLength(n)).toBe(encode(n, []));
		}
	});
});
