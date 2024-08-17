import { describe, it, expect } from 'bun:test';

import { create, decode, format, parse } from './index.js';

describe('parse', () => {
	it('parses a CIDv1 string successfully', () => {
		const result = parse('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee');

		expect(result).toEqual({
			version: 1,
			code: 113,
			bytes: new Uint8Array([
				1, 113, 18, 32, 229, 45, 250, 13, 19, 234, 237, 45, 22, 48, 206, 40, 107, 154, 36, 93, 19, 45, 211,
				240, 146, 123, 169, 106, 94, 123, 90, 32, 226, 174, 251, 33,
			]),
			digest: {
				code: 18,
				size: 34,
				bytes: new Uint8Array([
					18, 32, 229, 45, 250, 13, 19, 234, 237, 45, 22, 48, 206, 40, 107, 154, 36, 93, 19, 45, 211, 240,
					146, 123, 169, 106, 94, 123, 90, 32, 226, 174, 251, 33,
				]),
				digest: new Uint8Array([
					229, 45, 250, 13, 19, 234, 237, 45, 22, 48, 206, 40, 107, 154, 36, 93, 19, 45, 211, 240, 146, 123,
					169, 106, 94, 123, 90, 32, 226, 174, 251, 33,
				]),
			},
		});
	});

	it('fails on non-v1 CIDs', () => {
		expect(() => parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')).toThrow(
			'only base32 cidv1 is supported',
		);
	});
});

describe('decode', () => {
	it('decodes a buffer successfully', () => {
		const buf = new Uint8Array([
			1, 112, 18, 32, 114, 82, 82, 62, 101, 145, 251, 143, 229, 83, 214, 127, 245, 90, 134, 248, 64, 68, 180,
			106, 62, 65, 118, 225, 12, 88, 250, 82, 154, 74, 171, 213,
		]);

		const cid = decode(buf);

		expect(cid.version).toBe(1);
		expect(cid.code).toBe(112);

		expect(format(cid)).toBe('bafybeidskjjd4zmr7oh6ku6wp72vvbxyibcli2r6if3ocdcy7jjjusvl2u');
	});
});

describe('create', () => {
	it('creates a cid successfully', async () => {
		const utf8 = new TextEncoder();

		const cid = await create(112, utf8.encode('abc'));

		expect(format(cid)).toBe('bafybeif2pall7dybz7vecqka3zo24irdwabwdi4wc55jznaq75q7eaavvu');
	});
});
