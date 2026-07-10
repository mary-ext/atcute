import { Buffer as NodeBuffer } from 'node:buffer';

import { allocUnsafe } from '@atcute/uint8array';

const UPPER_RE = /[A-F]/;

const _hexSlice = /*#__PURE__*/ (() => NodeBuffer.prototype.hexSlice)();
const _hexWrite = /*#__PURE__*/ (() => NodeBuffer.prototype.hexWrite)();

export const fromBase16 = (str: string): Uint8Array<ArrayBuffer> => {
	if (UPPER_RE.test(str)) {
		throw new SyntaxError(`unexpected uppercase characters in base16 string`);
	}
	if (str.length & 1) {
		throw new SyntaxError(`unexpected end of base16 string`);
	}

	const bytes = allocUnsafe(str.length >>> 1);

	// hexWrite stops at the first invalid pair rather than throwing, leaving the remainder of the
	// buffer as uninitialized memory
	if (_hexWrite.call(bytes, str) !== bytes.length) {
		throw new SyntaxError(`invalid base16 string`);
	}

	return bytes;
};

export const toBase16 = (bytes: Uint8Array): string => {
	return _hexSlice.call(bytes);
};
