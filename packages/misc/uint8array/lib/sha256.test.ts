import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { toSha256Sync as sha256Node } from './index.node.ts';
import { toSha256Sync as sha256Js } from './sha256.ts';

const toHex = (bytes: Uint8Array): string => {
	return Buffer.from(bytes).toString('hex');
};

const expected = (data: Uint8Array): string => {
	return createHash('sha256').update(data).digest('hex');
};

const implementations = [
	['javascript', sha256Js],
	['node', sha256Node],
] as const;

describe.each(implementations)('sha256 (%s)', (_, sha256) => {
	it('matches known vectors', () => {
		expect(toHex(sha256(new Uint8Array(0)))).toBe(
			'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		);
		expect(toHex(sha256(new TextEncoder().encode('abc')))).toBe(
			'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
		);
		expect(
			toHex(sha256(new TextEncoder().encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))),
		).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
	});

	it('matches node:crypto across block boundaries', () => {
		const data = new Uint8Array(1100);
		for (let idx = 0; idx < data.length; idx++) {
			data[idx] = (idx * 131 + 7) & 0xff;
		}

		for (let len = 0; len <= data.length; len++) {
			const slice = data.subarray(0, len);
			expect(toHex(sha256(slice)), `length ${len}`).toBe(expected(slice));
		}
	});

	it('hashes views at an offset into a larger buffer', () => {
		const data = new Uint8Array(300);
		for (let idx = 0; idx < data.length; idx++) {
			data[idx] = idx & 0xff;
		}

		const view = data.subarray(13, 250);
		expect(toHex(sha256(view))).toBe(expected(view));
	});

	it('handles a shorter message after a longer one', () => {
		const long = new Uint8Array(1000).fill(0xff);
		const short = new TextEncoder().encode('com.example.record/self');

		sha256(long);
		expect(toHex(sha256(short))).toBe(expected(short));
	});

	it('returns a digest that is not overwritten by later calls', () => {
		const first = sha256(new Uint8Array([1]));
		const snapshot = toHex(first);

		sha256(new Uint8Array([2]));
		expect(toHex(first)).toBe(snapshot);
	});
});
