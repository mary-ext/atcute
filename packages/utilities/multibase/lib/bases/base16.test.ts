import { expect, it, mock } from 'bun:test';

import { fromBase16 as fromBase16Node, toBase16 as toBase16Node } from './base16-node.js';
import { fromBase16 as fromBase16Native, toBase16 as toBase16Native } from './base16-web-native.js';
import { fromBase16 as fromBase16Polyfill, toBase16 as toBase16Polyfill } from './base16-web-polyfill.js';

const inputs = [
	{
		buffer: Uint8Array.from([
			68, 101, 99, 101, 110, 116, 114, 97, 108, 105, 122, 101, 32, 101, 118, 101, 114, 121, 116, 104, 105,
			110, 103, 33, 33,
		]),
		encoded: `446563656e7472616c697a652065766572797468696e672121`,
	},
	{
		buffer: Uint8Array.from([121, 101, 115, 32, 109, 97, 110, 105, 32, 33]),
		encoded: `796573206d616e692021`,
	},
	{
		buffer: Uint8Array.from([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]),
		encoded: `68656c6c6f20776f726c64`,
	},
	{
		buffer: Uint8Array.from([0, 121, 101, 115, 32, 109, 97, 110, 105, 32, 33]),
		encoded: `00796573206d616e692021`,
	},
	{
		buffer: Uint8Array.from([0, 0, 121, 101, 115, 32, 109, 97, 110, 105, 32, 33]),
		encoded: `0000796573206d616e692021`,
	},
];

mock.module('@atcute/uint8array', () => {
	return {
		allocUnsafe: (size: number): Uint8Array => {
			return crypto.getRandomValues(new Uint8Array(size));
		},
	};
});

it('can encode', () => {
	for (const { buffer, encoded } of inputs) {
		expect(toBase16Polyfill(buffer)).toEqual(encoded);
		expect(toBase16Node(buffer)).toEqual(encoded);
		expect(toBase16Native(buffer)).toEqual(encoded);
	}
});

it('can decode', () => {
	for (const { buffer, encoded } of inputs) {
		expect(fromBase16Polyfill(encoded)).toEqual(buffer);
		expect(fromBase16Node(encoded)).toEqual(buffer);
		expect(fromBase16Native(encoded)).toEqual(buffer);
	}
});
