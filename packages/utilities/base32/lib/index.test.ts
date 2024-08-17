import { describe, it, expect } from 'bun:test';

import { decode, encode } from './index.js';

describe('encode', () => {
	it('encodes', () => {
		const utf8 = new TextEncoder();
		const base32 = encode(utf8.encode('lorem ipsum'));

		expect(base32).toBe('nrxxezlnebuxa43vnu');
	});
});

describe('decode', () => {
	it('decodes', () => {
		const utf8 = new TextDecoder();
		const u8 = decode('mrxwy33sebzws5bamfwwk5a');

		expect(utf8.decode(u8)).toBe('dolor sit amet');
	});

	it('fails on anything beyond base32', () => {
		expect(() => decode('1')).toThrow('invalid base32 string');
	});

	it('fails on unexpected end', () => {
		expect(() => decode('2')).toThrow('unexpected end of data');
	});
});
