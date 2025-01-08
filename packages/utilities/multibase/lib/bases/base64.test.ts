import { describe, expect, it, mock } from 'bun:test';

import {
	fromBase64 as _fromBase64Node,
	fromBase64Pad as _fromBase64PadNode,
	fromBase64Url as _fromBase64UrlNode,
	fromBase64UrlPad as _fromBase64UrlPadNode,
	toBase64 as _toBase64Node,
	toBase64Pad as _toBase64PadNode,
	toBase64Url as _toBase64UrlNode,
	toBase64UrlPad as _toBase64UrlPadNode,
} from './base64-node.js';
import {
	_fromBase64Native,
	_fromBase64PadNative,
	_fromBase64PadPolyfill,
	_fromBase64Polyfill,
	_fromBase64UrlNative,
	_fromBase64UrlPadNative,
	_fromBase64UrlPadPolyfill,
	_fromBase64UrlPolyfill,
	_toBase64Native,
	_toBase64PadNative,
	_toBase64PadPolyfill,
	_toBase64Polyfill,
	_toBase64UrlNative,
	_toBase64UrlPadNative,
	_toBase64UrlPadPolyfill,
	_toBase64UrlPolyfill,
} from './base64-web.js';

const inputs = [
	{
		buffer: Uint8Array.from([63, 63, 63, 63]),
		base64: 'Pz8/Pw',
		base64pad: 'Pz8/Pw==',
		base64url: 'Pz8_Pw',
		base64urlpad: 'Pz8_Pw==',
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
	for (const input of inputs) {
		expect(_toBase64Polyfill(input.buffer)).toEqual(input.base64);
		expect(_toBase64Node(input.buffer)).toEqual(input.base64);
		expect(_toBase64Native(input.buffer)).toEqual(input.base64);

		expect(_toBase64PadPolyfill(input.buffer)).toEqual(input.base64pad);
		expect(_toBase64PadNode(input.buffer)).toEqual(input.base64pad);
		expect(_toBase64PadNative(input.buffer)).toEqual(input.base64pad);

		expect(_toBase64UrlPolyfill(input.buffer)).toEqual(input.base64url);
		expect(_toBase64UrlNode(input.buffer)).toEqual(input.base64url);
		expect(_toBase64UrlNative(input.buffer)).toEqual(input.base64url);

		expect(_toBase64UrlPadPolyfill(input.buffer)).toEqual(input.base64urlpad);
		expect(_toBase64UrlPadNode(input.buffer)).toEqual(input.base64urlpad);
		expect(_toBase64UrlPadNative(input.buffer)).toEqual(input.base64urlpad);
	}
});

it('can decode', () => {
	for (const input of inputs) {
		expect(_fromBase64Polyfill(input.base64)).toEqual(input.buffer);
		expect(_fromBase64Node(input.base64)).toEqual(input.buffer);
		expect(_fromBase64Native(input.base64)).toEqual(input.buffer);

		expect(_fromBase64PadPolyfill(input.base64pad)).toEqual(input.buffer);
		expect(_fromBase64PadNode(input.base64pad)).toEqual(input.buffer);
		expect(_fromBase64PadNative(input.base64pad)).toEqual(input.buffer);

		expect(_fromBase64UrlPolyfill(input.base64url)).toEqual(input.buffer);
		expect(_fromBase64UrlNode(input.base64url)).toEqual(input.buffer);
		expect(_fromBase64UrlNative(input.base64url)).toEqual(input.buffer);

		expect(_fromBase64UrlPadPolyfill(input.base64urlpad)).toEqual(input.buffer);
		expect(_fromBase64UrlPadNode(input.base64urlpad)).toEqual(input.buffer);
		expect(_fromBase64UrlPadNative(input.base64urlpad)).toEqual(input.buffer);
	}
});

describe('nopad', () => {
	it('throws on padding', () => {
		for (const input of inputs) {
			expect(() => _fromBase64Polyfill(input.base64pad)).toThrowError();
			expect(() => _fromBase64Node(input.base64pad)).toThrowError();
			expect(() => _fromBase64Native(input.base64pad)).toThrowError();

			expect(() => _fromBase64UrlPolyfill(input.base64urlpad)).toThrowError();
			expect(() => _fromBase64UrlNode(input.base64urlpad)).toThrowError();
			expect(() => _fromBase64UrlNative(input.base64urlpad)).toThrowError();
		}
	});
});

describe('pad', () => {
	it('throws on no padding', () => {
		for (const input of inputs) {
			// expect(() => _fromBase64PadPolyfill(input.base64)).toThrowError();
			expect(() => _fromBase64PadNode(input.base64)).toThrowError();
			expect(() => _fromBase64PadNative(input.base64)).toThrowError();

			// expect(() => _fromBase64UrlPadPolyfill(input.base64url)).toThrowError();
			expect(() => _fromBase64UrlPadNode(input.base64url)).toThrowError();
			expect(() => _fromBase64UrlPadNative(input.base64url)).toThrowError();
		}
	});
});
