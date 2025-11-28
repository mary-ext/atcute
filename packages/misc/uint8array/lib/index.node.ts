import { Buffer as NodeBuffer } from 'node:buffer';
import { hash as _hash, timingSafeEqual as _timingSafeEqual } from 'node:crypto';

const _alloc = /*#__PURE__*/ NodeBuffer.alloc;
const _allocUnsafe = /*#__PURE__*/ NodeBuffer.allocUnsafe;
const _concat = /*#__PURE__*/ NodeBuffer.concat;
const _from = /*#__PURE__*/ NodeBuffer.from;

const _compare = /*#__PURE__*/ NodeBuffer.prototype.compare;
const _equals = /*#__PURE__*/ NodeBuffer.prototype.equals;
const _utf8Slice = /*#__PURE__*/ NodeBuffer.prototype.utf8Slice;
const _utf8Write = /*#__PURE__*/ NodeBuffer.prototype.utf8Write;

const toUint8Array = (buffer: NodeBuffer) => {
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const alloc = (size: number): Uint8Array<ArrayBuffer> => {
	return toUint8Array(_alloc(size)) as Uint8Array<ArrayBuffer>;
};

export const allocUnsafe = (size: number): Uint8Array<ArrayBuffer> => {
	return toUint8Array(_allocUnsafe(size)) as Uint8Array<ArrayBuffer>;
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

export const concat = (arrays: Uint8Array[], size?: number): Uint8Array<ArrayBuffer> => {
	return toUint8Array(_concat(arrays, size)) as Uint8Array<ArrayBuffer>;
};

export const encodeUtf8 = (str: string): Uint8Array<ArrayBuffer> => {
	return toUint8Array(_from(str, 'utf8')) as Uint8Array<ArrayBuffer>;
};

export const encodeUtf8Into = (to: Uint8Array, str: string, offset?: number, length?: number): number => {
	return _utf8Write.call(to, str, offset, length);
};

const _fromCharCode = String.fromCharCode;

export const decodeUtf8From = (
	from: Uint8Array,
	offset: number = 0,
	length: number = from.length,
): string => {
	// for short strings, avoid utf8Slice overhead by using fromCharCode directly
	if (length <= 24) {
		const end = offset + length;
		let str = '';
		let idx = offset;

		// process 4 bytes at a time
		for (; idx + 3 < end; idx += 4) {
			const a = from[idx];
			const b = from[idx + 1];
			const c = from[idx + 2];
			const d = from[idx + 3];

			if ((a | b | c | d) & 0x80) {
				// non-ASCII, fall back to utf8Slice for the rest
				return str + _utf8Slice.call(from, idx, end);
			}

			str += _fromCharCode(a, b, c, d);
		}

		// process remaining bytes
		for (; idx < end; idx++) {
			const x = from[idx];

			if (x & 0x80) {
				return str + _utf8Slice.call(from, idx, end);
			}

			str += _fromCharCode(x);
		}

		return str;
	}

	return _utf8Slice.call(from, offset, offset + length);
};

export const toSha256 = async (buffer: Uint8Array): Promise<Uint8Array<ArrayBuffer>> => {
	return toUint8Array(_hash('sha256', buffer, 'buffer')) as Uint8Array<ArrayBuffer>;
};
