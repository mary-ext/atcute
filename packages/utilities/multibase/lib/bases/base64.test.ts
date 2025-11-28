import { describe, expect, it, vi } from 'vitest';

import {
	fromBase64 as fromBase64Node,
	fromBase64Pad as fromBase64PadNode,
	fromBase64Url as fromBase64UrlNode,
	fromBase64UrlPad as fromBase64UrlPadNode,
	toBase64 as toBase64Node,
	toBase64Pad as toBase64PadNode,
	toBase64Url as toBase64UrlNode,
	toBase64UrlPad as toBase64UrlPadNode,
} from './base64-node.js';
import {
	fromBase64 as fromBase64Native,
	fromBase64Pad as fromBase64PadNative,
	fromBase64Url as fromBase64UrlNative,
	fromBase64UrlPad as fromBase64UrlPadNative,
	toBase64 as toBase64Native,
	toBase64Pad as toBase64PadNative,
	toBase64Url as toBase64UrlNative,
	toBase64UrlPad as toBase64UrlPadNative,
} from './base64-web-native.js';
import {
	fromBase64Pad as fromBase64PadPolyfill,
	fromBase64 as fromBase64Polyfill,
	fromBase64UrlPad as fromBase64UrlPadPolyfill,
	fromBase64Url as fromBase64UrlPolyfill,
	toBase64Pad as toBase64PadPolyfill,
	toBase64 as toBase64Polyfill,
	toBase64UrlPad as toBase64UrlPadPolyfill,
	toBase64Url as toBase64UrlPolyfill,
} from './base64-web-polyfill.js';

vi.mock('@atcute/uint8array', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@atcute/uint8array')>();
	return {
		...actual,
		allocUnsafe: (size: number): Uint8Array => {
			return crypto.getRandomValues(new Uint8Array(size));
		},
	};
});

// native methods only available in Node.js 22.1+ or modern browsers
const hasNativeMethods = typeof Uint8Array.prototype.toBase64 === 'function';

const inputs = [
	{
		buffer: Uint8Array.from([63, 63, 63, 63]),
		base64: 'Pz8/Pw',
		base64pad: 'Pz8/Pw==',
		base64url: 'Pz8_Pw',
		base64urlpad: 'Pz8_Pw==',
	},
];

describe('polyfill', () => {
	it('can encode', () => {
		for (const input of inputs) {
			expect(toBase64Polyfill(input.buffer)).toEqual(input.base64);
			expect(toBase64PadPolyfill(input.buffer)).toEqual(input.base64pad);
			expect(toBase64UrlPolyfill(input.buffer)).toEqual(input.base64url);
			expect(toBase64UrlPadPolyfill(input.buffer)).toEqual(input.base64urlpad);
		}
	});

	it('can decode', () => {
		for (const input of inputs) {
			expect(fromBase64Polyfill(input.base64)).toEqual(input.buffer);
			expect(fromBase64PadPolyfill(input.base64pad)).toEqual(input.buffer);
			expect(fromBase64UrlPolyfill(input.base64url)).toEqual(input.buffer);
			expect(fromBase64UrlPadPolyfill(input.base64urlpad)).toEqual(input.buffer);
		}
	});
});

describe('node', () => {
	it('can encode', () => {
		for (const input of inputs) {
			expect(toBase64Node(input.buffer)).toEqual(input.base64);
			expect(toBase64PadNode(input.buffer)).toEqual(input.base64pad);
			expect(toBase64UrlNode(input.buffer)).toEqual(input.base64url);
			expect(toBase64UrlPadNode(input.buffer)).toEqual(input.base64urlpad);
		}
	});

	it('can decode', () => {
		for (const input of inputs) {
			expect(fromBase64Node(input.base64)).toEqual(input.buffer);
			expect(fromBase64PadNode(input.base64pad)).toEqual(input.buffer);
			expect(fromBase64UrlNode(input.base64url)).toEqual(input.buffer);
			expect(fromBase64UrlPadNode(input.base64urlpad)).toEqual(input.buffer);
		}
	});
});

describe.skipIf(!hasNativeMethods)('native', () => {
	it('can encode', () => {
		for (const input of inputs) {
			expect(toBase64Native(input.buffer)).toEqual(input.base64);
			expect(toBase64PadNative(input.buffer)).toEqual(input.base64pad);
			expect(toBase64UrlNative(input.buffer)).toEqual(input.base64url);
			expect(toBase64UrlPadNative(input.buffer)).toEqual(input.base64urlpad);
		}
	});

	it('can decode', () => {
		for (const input of inputs) {
			expect(fromBase64Native(input.base64)).toEqual(input.buffer);
			expect(fromBase64PadNative(input.base64pad)).toEqual(input.buffer);
			expect(fromBase64UrlNative(input.base64url)).toEqual(input.buffer);
			expect(fromBase64UrlPadNative(input.base64urlpad)).toEqual(input.buffer);
		}
	});
});
