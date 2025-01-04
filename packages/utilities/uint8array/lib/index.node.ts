import { Buffer as NodeBuffer } from 'node:buffer';
import { hash as _hash, timingSafeEqual as _timingSafeEqual } from 'node:crypto';

const _alloc = /*#__PURE__*/ NodeBuffer.alloc;
const _allocUnsafe = /*#__PURE__*/ NodeBuffer.allocUnsafe;
const _concat = /*#__PURE__*/ NodeBuffer.concat;

const _compare = /*#__PURE__*/ NodeBuffer.prototype.compare;
const _equals = /*#__PURE__*/ NodeBuffer.prototype.equals;
const _utf8Slice = /*#__PURE__*/ NodeBuffer.prototype.utf8Slice;
const _utf8Write = /*#__PURE__*/ NodeBuffer.prototype.utf8Write;

const toUint8Array = (buffer: NodeBuffer) => {
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const alloc = (size: number): Uint8Array => {
	return toUint8Array(_alloc(size));
};

export const allocUnsafe = (size: number): Uint8Array => {
	return toUint8Array(_allocUnsafe(size));
};

export const compare = (a: Uint8Array, b: Uint8Array): number => {
	return _compare.call(a, b);
};

export const equals = (a: Uint8Array, b: Uint8Array): boolean => {
	return _equals.call(a, b);
};

export const timingSafeEquals = (a: Uint8Array, b: Uint8Array): boolean => {
	return _timingSafeEqual(a, b);
};

export const concat = (arrays: Uint8Array[], size?: number): Uint8Array => {
	return toUint8Array(_concat(arrays, size));
};

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

export const toSha256 = async (buffer: Uint8Array): Promise<Uint8Array> => {
	return toUint8Array(_hash('sha256', buffer, 'buffer'));
};
