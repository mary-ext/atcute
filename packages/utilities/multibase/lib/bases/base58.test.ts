import { expect, it, mock } from 'bun:test';

import { fromBase58Btc, toBase58Btc } from './base58.js';

const inputs = [
	{
		buffer: Uint8Array.from([
			68, 101, 99, 101, 110, 116, 114, 97, 108, 105, 122, 101, 32, 101, 118, 101, 114, 121, 116, 104, 105,
			110, 103, 33, 33,
		]),
		encoded: `UXE7GvtEk8XTXs1GF8HSGbVA9FCX9SEBPe`,
	},
	{
		buffer: Uint8Array.from([121, 101, 115, 32, 109, 97, 110, 105, 32, 33]),
		encoded: `7paNL19xttacUY`,
	},
	{
		buffer: Uint8Array.from([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]),
		encoded: `StV1DL6CwTryKyV`,
	},
	{
		buffer: Uint8Array.from([0, 121, 101, 115, 32, 109, 97, 110, 105, 32, 33]),
		encoded: `17paNL19xttacUY`,
	},
	{
		buffer: Uint8Array.from([0, 0, 121, 101, 115, 32, 109, 97, 110, 105, 32, 33]),
		encoded: `117paNL19xttacUY`,
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
		expect(toBase58Btc(buffer)).toEqual(encoded);
	}
});

it('can decode', () => {
	for (const { buffer, encoded } of inputs) {
		expect(fromBase58Btc(encoded)).toEqual(buffer);
	}
});
