import { Buffer as NodeBuffer } from 'node:buffer';
import * as crypto from 'node:crypto';

const toUint8Array = (buffer: NodeBuffer) => {
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const alloc = (size: number): Uint8Array => {
	return toUint8Array(NodeBuffer.alloc(size));
};

export const allocUnsafe = (size: number): Uint8Array => {
	return toUint8Array(NodeBuffer.allocUnsafe(size));
};

export const compare = (a: Uint8Array, b: Uint8Array): number => {
	return NodeBuffer.compare(a, b);
};

export const equals = (a: Uint8Array, b: Uint8Array): boolean => {
	return NodeBuffer.compare(a, b) === 0;
};

export const timingSafeEquals = (a: Uint8Array, b: Uint8Array): boolean => {
	return crypto.timingSafeEqual(a, b);
};

export const concat = (arrays: Uint8Array[], size?: number): Uint8Array => {
	return toUint8Array(Buffer.concat(arrays, size));
};

const _utf8Write = /*#__PURE__*/ NodeBuffer.prototype.utf8Write;
const _utf8Slice = /*#__PURE__*/ NodeBuffer.prototype.utf8Slice;

export const encodeUtf8Into = (to: Uint8Array, str: string, offset?: number, length?: number): number => {
	return _utf8Write.call(to, str, offset, length);
};

export const decodeUtf8From = (
	from: Uint8Array,
	offset: number = 0,
	length: number = from.length,
): string => {
	return _utf8Slice.call(from, offset, offset + length);
};
