import { Buffer as NodeBuffer } from 'node:buffer';

import { allocUnsafe } from '@atcute/uint8array';

// `base64` has padding
const _base64Slice = /*#__PURE__*/ NodeBuffer.prototype.base64Slice;
const _base64Write = /*#__PURE__*/ NodeBuffer.prototype.base64Write;

// `base64url` has no padding
const _base64UrlSlice = /*#__PURE__*/ NodeBuffer.prototype.base64urlSlice;
const _base64UrlWrite = /*#__PURE__*/ NodeBuffer.prototype.base64urlWrite;

const getBase64ByteLength = (str: string, padded: boolean): number => {
	let length = str.length;
	if (padded) {
		if (str.charCodeAt(length - 1) === 0x3d) {
			length--;
		}
		if (length > 1 && str.charCodeAt(length - 1) === 0x3d) {
			length--;
		}
	}

	return (length * 3) >>> 2;
};

const trimBase64Padding = (str: string): string => {
	const end = str.length - 1;
	if (str.charCodeAt(end) !== 0x3d) {
		return str;
	}

	if (str.charCodeAt(end - 1) !== 0x3d) {
		return str.slice(0, end);
	}

	return str.slice(0, end - 1);
};

export const fromBase64 = (str: string): Uint8Array<ArrayBuffer> => {
	const length = getBase64ByteLength(str, false);
	const bytes = allocUnsafe(length);
	const written = _base64Write.call(bytes, str);

	return length > written ? bytes.subarray(0, written) : bytes;
};

export const toBase64 = (bytes: Uint8Array): string => {
	return trimBase64Padding(_base64Slice.call(bytes));
};

export const fromBase64Pad = (str: string): Uint8Array<ArrayBuffer> => {
	const length = getBase64ByteLength(str, true);
	const bytes = allocUnsafe(length);
	const written = _base64Write.call(bytes, str);

	return length > written ? bytes.subarray(0, written) : bytes;
};

export const toBase64Pad = (bytes: Uint8Array): string => {
	return _base64Slice.call(bytes);
};

export const fromBase64Url = (str: string): Uint8Array<ArrayBuffer> => {
	const length = getBase64ByteLength(str, false);
	const bytes = allocUnsafe(length);
	const written = _base64UrlWrite.call(bytes, str);

	return length > written ? bytes.subarray(0, written) : bytes;
};

export const toBase64Url = (bytes: Uint8Array): string => {
	return _base64UrlSlice.call(bytes);
};

export const fromBase64UrlPad = (str: string): Uint8Array<ArrayBuffer> => {
	const length = getBase64ByteLength(str, true);
	const bytes = allocUnsafe(length);
	const written = _base64UrlWrite.call(bytes, str);

	return length > written ? bytes.subarray(0, written) : bytes;
};

const PADDING = ['', '===', '==', '='];
export const toBase64UrlPad = (bytes: Uint8Array): string => {
	const str = _base64UrlSlice.call(bytes);
	return str + PADDING[str.length % 4];
};
