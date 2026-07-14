import { describe, expect, it, vi } from 'vitest';

import * as base16Node from './base16-node.ts';
import * as base16Native from './base16-web-native.ts';
import * as base16Polyfill from './base16-web-polyfill.ts';
import * as base64Node from './base64-node.ts';
import * as base64Native from './base64-web-native.ts';
import * as base64Polyfill from './base64-web-polyfill.ts';

// random-fill uninitialized buffers so under-writes surface instead of being masked by zeroes
vi.mock('@atcute/uint8array', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@atcute/uint8array')>();
	return {
		...actual,
		allocUnsafe: (size: number): Uint8Array => crypto.getRandomValues(new Uint8Array(size)),
	};
});

const hasNativeBase64 = typeof Uint8Array.prototype.toBase64 === 'function';
const hasNativeBase16 = typeof Uint8Array.prototype.toHex === 'function';

type Expected = number[] | 'throw';
type Case = [input: string, expected: Expected];

const bytes = (...xs: number[]): number[] => xs;

const runMatrix = (
	label: string,
	fnName: string,
	backends: [name: string, fn: (str: string) => Uint8Array][],
	cases: Case[],
): void => {
	describe(`${label} ${fnName}`, () => {
		for (const [name, fn] of backends) {
			for (const [input, expected] of cases) {
				const title =
					expected === 'throw'
						? `${name}: rejects ${JSON.stringify(input)}`
						: `${name}: decodes ${JSON.stringify(input)}`;
				it(title, () => {
					if (expected === 'throw') {
						expect(() => fn(input)).toThrow();
					} else {
						expect(Array.from(fn(input))).toEqual(expected);
					}
				});
			}
		}
	});
};

// #region base64 unpadded (standard alphabet)
{
	const backends: [string, (s: string) => Uint8Array][] = [
		['node', base64Node.fromBase64],
		['polyfill', base64Polyfill.fromBase64],
		...(hasNativeBase64
			? ([['native', base64Native.fromBase64]] as [string, (s: string) => Uint8Array][])
			: []),
	];
	runMatrix('base64', 'fromBase64', backends, [
		['', bytes()],
		['Pz8/Pw', bytes(63, 63, 63, 63)],
		['PA', bytes(60)],
		['AAAA', bytes(0, 0, 0)],
		['Pz8/Pw==', 'throw'], // padding on an unpadded codec
		['PP', 'throw'], // non-canonical trailing bits
		['Pz9', 'throw'], // non-canonical trailing bits
		['P', 'throw'], // lone character
		['AŁAA', 'throw'], // non-ascii aliasing
		['AB-C', 'throw'], // url alphabet in a standard string
		['AB_C', 'throw'],
		['Pz8 /Pw', 'throw'], // embedded whitespace
		['A B', 'throw'],
		['!!!!', 'throw'],
	]);
}
// #endregion

// #region base64 padded (standard alphabet)
{
	const backends: [string, (s: string) => Uint8Array][] = [
		['node', base64Node.fromBase64Pad],
		['polyfill', base64Polyfill.fromBase64Pad],
		...(hasNativeBase64
			? ([['native', base64Native.fromBase64Pad]] as [string, (s: string) => Uint8Array][])
			: []),
	];
	runMatrix('base64pad', 'fromBase64Pad', backends, [
		['Pz8/Pw==', bytes(63, 63, 63, 63)],
		['PA==', bytes(60)],
		['AAAA', bytes(0, 0, 0)], // exact group needs no padding
		['QUJDRA==', bytes(65, 66, 67, 68)],
		['Pz8/Pw', 'throw'], // missing padding
		['PA=', 'throw'], // insufficient padding
		['PA===', 'throw'], // excess padding
		['AA=A', 'throw'], // interior padding
		['====', 'throw'], // all padding
		['PP==', 'throw'], // non-canonical trailing bits
		['Pz8/ Pw==', 'throw'], // embedded whitespace
	]);
}
// #endregion

// #region base64 unpadded (url alphabet)
{
	const backends: [string, (s: string) => Uint8Array][] = [
		['node', base64Node.fromBase64Url],
		['polyfill', base64Polyfill.fromBase64Url],
		...(hasNativeBase64
			? ([['native', base64Native.fromBase64Url]] as [string, (s: string) => Uint8Array][])
			: []),
	];
	runMatrix('base64url', 'fromBase64Url', backends, [
		['Pz8_Pw', bytes(63, 63, 63, 63)],
		['PA', bytes(60)],
		['Pz8/Pw', 'throw'], // standard alphabet in a url string
		['Pz8_Pw==', 'throw'], // padding on an unpadded codec
		['PP', 'throw'], // non-canonical trailing bits
		['Pz8 _Pw', 'throw'], // embedded whitespace
	]);
}
// #endregion

// #region base64 padded (url alphabet)
{
	const backends: [string, (s: string) => Uint8Array][] = [
		['node', base64Node.fromBase64UrlPad],
		['polyfill', base64Polyfill.fromBase64UrlPad],
		...(hasNativeBase64
			? ([['native', base64Native.fromBase64UrlPad]] as [string, (s: string) => Uint8Array][])
			: []),
	];
	runMatrix('base64urlpad', 'fromBase64UrlPad', backends, [
		['Pz8_Pw==', bytes(63, 63, 63, 63)],
		['PA==', bytes(60)],
		['Pz8_Pw', 'throw'], // missing padding
		['Pz8/Pw==', 'throw'], // standard alphabet in a url string
		['PP==', 'throw'], // non-canonical trailing bits
	]);
}
// #endregion

// #region base16
{
	const backends: [string, (s: string) => Uint8Array][] = [
		['node', base16Node.fromBase16],
		['polyfill', base16Polyfill.fromBase16],
		...(hasNativeBase16
			? ([['native', base16Native.fromBase16]] as [string, (s: string) => Uint8Array][])
			: []),
	];
	runMatrix('base16', 'fromBase16', backends, [
		['', bytes()],
		['deadbeef', bytes(0xde, 0xad, 0xbe, 0xef)],
		['DEADBEEF', 'throw'], // uppercase is not multibase base16
		['DeadBeef', 'throw'],
		['abc', 'throw'], // odd length
		['gg', 'throw'], // non-hex
		['de ad', 'throw'], // whitespace
	]);
}
// #endregion
