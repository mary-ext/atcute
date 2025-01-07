import { Buffer as NodeBuffer } from 'node:buffer';

import { allocUnsafe } from '@atcute/uint8array';

const UPPER_RE = /[A-F]/;

const _hexSlice = NodeBuffer.prototype.hexSlice;
const _hexWrite = NodeBuffer.prototype.hexWrite;

export const fromBase16 = (str: string): Uint8Array => {
	if (UPPER_RE.test(str)) {
		throw new SyntaxError(`unexpected uppercase characters in base16 string`);
	}

	const bytes = allocUnsafe(str.length >>> 1);
	_hexWrite.call(bytes, str);

	return bytes;
};

export const toBase16 = (bytes: Uint8Array): string => {
	return _hexSlice.call(bytes);
};
