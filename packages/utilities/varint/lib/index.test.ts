import { it, expect, describe } from 'bun:test';

import { decode, encode, encodingLength } from './index.js';

function randint(range: number): number {
	return Math.floor(Math.random() * range);
}

it('passes fuzzy test', () => {
	for (let i = 0; i < 500; ++i) {
		const expected = randint(0x7fffffff);

		const encoded: number[] = [];
		const encodedLength = encode(expected, encoded);

		const [actual, actualLength] = decode(encoded);

		expect(actual).toBe(expected);
		expect(actualLength).toBe(encodedLength);
	}
});

describe('encode', () => {
	it('throws on very large numbers', () => {
		expect(() => encode(2 ** 54 - 1, [])).toThrow();
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
