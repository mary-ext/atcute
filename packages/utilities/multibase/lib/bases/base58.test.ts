import { describe, expect, it, vi } from 'vitest';

import {
	fromBase58Btc as fromBase58BtcNode,
	hasNative,
	toBase58Btc as toBase58BtcNode,
} from './base58.node.ts';
import { fromBase58Btc, toBase58Btc } from './base58.ts';

vi.mock('@atcute/uint8array', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@atcute/uint8array')>();
	return {
		...actual,
		allocUnsafe: (size: number): Uint8Array => {
			return crypto.getRandomValues(new Uint8Array(size));
		},
	};
});

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

describe.skipIf(!hasNative)('native', () => {
	it('encode matches', () => {
		for (const { buffer, encoded } of inputs) {
			expect(toBase58BtcNode(buffer)).toEqual(encoded);
		}
	});

	it('decode matches', () => {
		for (const { buffer, encoded } of inputs) {
			expect(Uint8Array.from(fromBase58BtcNode(encoded))).toEqual(buffer);
		}
	});

	it('encode safely fails on invalid input', () => {
		const toBase58BtcNodeAny = toBase58BtcNode as any;
		expect(() => toBase58BtcNodeAny('lmao')).toThrow(TypeError);
		expect(() => toBase58BtcNodeAny(1337)).toThrow(TypeError);
		expect(() => toBase58BtcNodeAny(null)).toThrow(TypeError);
		expect(() => toBase58BtcNodeAny()).toThrow(TypeError);
	});

	it('decode safely fails on invalid input', () => {
		const fromBase58BtcNodeAny = fromBase58BtcNode as any;
		expect(() => fromBase58BtcNodeAny(new Uint8Array(15))).toThrow(TypeError);
		expect(() => fromBase58BtcNodeAny(1337)).toThrow(TypeError);
		expect(() => fromBase58BtcNodeAny(null)).toThrow(TypeError);
		expect(() => fromBase58BtcNodeAny()).toThrow(TypeError);

		expect(() => fromBase58BtcNodeAny('\u{1F407}\u{1F338}\u{1F338}\u{1F338}\u{1F338}')).toThrow();
	});
});
