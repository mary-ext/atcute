import { allocUnsafe as _allocUnsafe, concatArrayBuffers as _concat } from 'bun';

import { Buffer as NodeBuffer } from 'node:buffer';
import { hash as _hash, timingSafeEqual as _timingSafeEqual } from 'node:crypto';

const _compare = /*#__PURE__*/ NodeBuffer.prototype.compare;
const _equals = /*#__PURE__*/ NodeBuffer.prototype.equals;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const toUint8Array = (buffer: NodeBuffer) => {
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const alloc = (size: number): Uint8Array => {
	return new Uint8Array(size);
};

export const allocUnsafe: (size: number) => Uint8Array = _allocUnsafe;

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
	// Bun's typings is slightly wrong, *you can* pass `size: undefined` with `asUint8Array: true`
	return _concat(arrays, size as number, true);
};

export const encodeUtf8: (str: string) => Uint8Array = textEncoder.encode.bind(textEncoder);

export const encodeUtf8Into = (to: Uint8Array, str: string, offset?: number, length?: number): number => {
	let buffer: Uint8Array;

	if (offset === undefined) {
		buffer = to;
	} else if (length === undefined) {
		buffer = to.subarray(offset);
	} else {
		buffer = to.subarray(offset, offset + length);
	}

	const result = textEncoder.encodeInto(str, buffer);

	return result.written;
};

const fromCharCode = String.fromCharCode;

/**
 * decodes a UTF-8 string from a given buffer
 */
export const decodeUtf8From = (from: Uint8Array, offset?: number, length?: number): string => {
	let buffer: Uint8Array;

	if (offset === undefined) {
		buffer = from;
	} else if (length === undefined) {
		buffer = from.subarray(offset);
	} else {
		buffer = from.subarray(offset, offset + length);
	}

	const end = buffer.length;
	if (end > 24) {
		return textDecoder.decode(buffer);
	}

	{
		let str = '';
		let idx = 0;

		for (; idx + 3 < end; idx += 4) {
			const a = buffer[idx];
			const b = buffer[idx + 1];
			const c = buffer[idx + 2];
			const d = buffer[idx + 3];

			if ((a | b | c | d) & 0x80) {
				return str + textDecoder.decode(buffer.subarray(idx));
			}

			str += fromCharCode(a, b, c, d);
		}

		for (; idx < end; idx++) {
			const x = buffer[idx];

			if (x & 0x80) {
				return str + textDecoder.decode(buffer.subarray(idx));
			}

			str += fromCharCode(x);
		}

		return str;
	}
};

export const toSha256 = async (buffer: Uint8Array): Promise<Uint8Array> => {
	return toUint8Array(_hash('sha256', buffer, 'buffer'));
};
