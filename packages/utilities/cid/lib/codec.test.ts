import { describe, expect, it } from 'vitest';

import { create, decode, fromString, toString } from './codec.ts';

describe('fromString', () => {
	it('parses a CIDv1 string', () => {
		const cid = fromString('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee');

		expect(cid).toEqual({
			version: 1,
			codec: 113,
			digest: {
				codec: 18,
				contents: Uint8Array.from([
					229, 45, 250, 13, 19, 234, 237, 45, 22, 48, 206, 40, 107, 154, 36, 93, 19, 45, 211, 240, 146, 123,
					169, 106, 94, 123, 90, 32, 226, 174, 251, 33,
				]),
			},
			bytes: Uint8Array.from([
				1, 113, 18, 32, 229, 45, 250, 13, 19, 234, 237, 45, 22, 48, 206, 40, 107, 154, 36, 93, 19, 45, 211,
				240, 146, 123, 169, 106, 94, 123, 90, 32, 226, 174, 251, 33,
			]),
		});
	});

	it('fails on non-v1 CID string', () => {
		expect(() => fromString('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')).toThrow(
			`not a valid cid string`,
		);
	});

	it('fails on empty CID string', () => {
		expect(() => fromString('bafyreaa')).toThrow(`not a valid cid string`);
	});
});

describe('decode', () => {
	it('decodes a CIDv1', () => {
		const buf = Uint8Array.from([
			1, 113, 18, 32, 114, 82, 82, 62, 101, 145, 251, 143, 229, 83, 214, 127, 245, 90, 134, 248, 64, 68, 180,
			106, 62, 65, 118, 225, 12, 88, 250, 82, 154, 74, 171, 213,
		]);

		const cid = decode(buf);

		expect(cid).toEqual({
			version: 1,
			codec: 113,
			digest: {
				codec: 18,
				contents: Uint8Array.from([
					114, 82, 82, 62, 101, 145, 251, 143, 229, 83, 214, 127, 245, 90, 134, 248, 64, 68, 180, 106, 62, 65,
					118, 225, 12, 88, 250, 82, 154, 74, 171, 213,
				]),
			},
			bytes: Uint8Array.from([
				1, 113, 18, 32, 114, 82, 82, 62, 101, 145, 251, 143, 229, 83, 214, 127, 245, 90, 134, 248, 64, 68,
				180, 106, 62, 65, 118, 225, 12, 88, 250, 82, 154, 74, 171, 213,
			]),
		});
	});

	it('fails on empty CIDv1', () => {
		const buf = Uint8Array.from([1, 113, 18, 0]);
		expect(() => decode(buf)).toThrow(`cid too short`);
	});
});

describe('create', () => {
	it('creates a CIDv1 string', async () => {
		const contents = new TextEncoder().encode('abc');
		const cid = await create(113, contents);

		expect(toString(cid)).toBe('bafyreif2pall7dybz7vecqka3zo24irdwabwdi4wc55jznaq75q7eaavvu');
	});
});
