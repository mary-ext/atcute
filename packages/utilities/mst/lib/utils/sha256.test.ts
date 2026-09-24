import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { encodeKey } from './keys.ts';
import { sha256 } from './sha256.ts';

const toHex = (words: Int32Array): string => {
	let hex = '';
	for (const word of words) {
		hex += (word >>> 0).toString(16).padStart(8, '0');
	}

	return hex;
};

const expected = (data: Uint8Array): string => {
	return createHash('sha256').update(data).digest('hex');
};

describe('sha256', () => {
	it('matches known vectors', () => {
		expect(toHex(sha256(new Uint8Array(0)))).toBe(
			'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		);
		expect(toHex(sha256(encodeKey('abc')))).toBe(
			'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
		);
	});

	it('matches node:crypto across block boundaries', () => {
		const data = new Uint8Array(1100);
		for (let idx = 0; idx < data.length; idx++) {
			data[idx] = (idx * 131 + 7) & 0xff;
		}

		// covers padding boundaries and messages that outgrow the scratch buffer
		for (let len = 0; len <= data.length; len++) {
			const slice = data.subarray(0, len);
			expect(toHex(sha256(slice)), `length ${len}`).toBe(expected(slice));
		}
	});

	it('handles a shorter message after a longer one', () => {
		const long = new Uint8Array(1000).fill(0xff);
		const short = encodeKey('com.example.record/self');

		sha256(long);
		expect(toHex(sha256(short))).toBe(expected(short));
	});
});
