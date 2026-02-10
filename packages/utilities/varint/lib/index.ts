const MSB = 0x80;
const REST = 0x7f;
const MSBALL = ~REST;
const INT = 2 ** 31;

const N1 = 2 ** 7;
const N2 = 2 ** 14;
const N3 = 2 ** 21;
const N4 = 2 ** 28;
const N5 = 2 ** 35;
const N6 = 2 ** 42;
const N7 = 2 ** 49;
const N8 = 2 ** 56;
const N9 = 2 ** 63;

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

const _min = Math.min;

export interface DecodeResult {
	/** decoded number */
	value: number;
	/** position immediately after the varint */
	nextOffset: number;
}

/**
 * encodes a varint
 * @param num Number to encode
 * @param buf Buffer to write on
 * @param offset Starting position on the buffer
 * @returns The amount of bytes written
 */
export const encode = (num: number, buf: Uint8Array, offset = 0): number => {
	if (num > MAX_SAFE_INTEGER) {
		throw new RangeError('could not encode varint');
	}

	const start = offset;

	if (num < N1) {
		buf[offset] = num;
		return 1;
	}

	if (num < N2) {
		buf[offset] = (num & REST) | MSB;
		buf[offset + 1] = num >>> 7;
		return 2;
	}

	if (num < N3) {
		buf[offset] = (num & REST) | MSB;
		buf[offset + 1] = ((num >>> 7) & REST) | MSB;
		buf[offset + 2] = num >>> 14;
		return 3;
	}

	if (num < N4) {
		buf[offset] = (num & REST) | MSB;
		buf[offset + 1] = ((num >>> 7) & REST) | MSB;
		buf[offset + 2] = ((num >>> 14) & REST) | MSB;
		buf[offset + 3] = num >>> 21;
		return 4;
	}

	if (num < INT) {
		buf[offset] = (num & REST) | MSB;
		buf[offset + 1] = ((num >>> 7) & REST) | MSB;
		buf[offset + 2] = ((num >>> 14) & REST) | MSB;
		buf[offset + 3] = ((num >>> 21) & REST) | MSB;
		buf[offset + 4] = num >>> 28;
		return 5;
	}

	while (num >= INT) {
		buf[offset++] = (num & 0xff) | MSB;
		num /= 128;
	}

	while (num & MSBALL) {
		buf[offset++] = (num & 0xff) | MSB;
		num >>>= 7;
	}

	buf[offset] = num | 0;
	return offset - start + 1;
};

/**
 * decodes a varint and returns the value with the next byte offset
 * @param buf buffer to read from
 * @param offset starting position on the buffer
 * @param length maximum bytes to consume from offset
 * @returns decoded value and the next offset
 */
export const decode = (buf: Uint8Array, offset = 0, length = buf.length): DecodeResult => {
	const end = _min(offset + length, buf.length);
	let counter = offset;

	if (counter >= end) {
		throw new RangeError('could not decode varint');
	}

	let b = buf[counter++];
	let res = b & REST;
	if (b < MSB) {
		return { value: res, nextOffset: counter };
	}

	if (counter >= end) {
		throw new RangeError('could not decode varint');
	}

	b = buf[counter++];
	res |= (b & REST) << 7;
	if (b < MSB) {
		return { value: res, nextOffset: counter };
	}

	if (counter >= end) {
		throw new RangeError('could not decode varint');
	}

	b = buf[counter++];
	res |= (b & REST) << 14;
	if (b < MSB) {
		return { value: res, nextOffset: counter };
	}

	if (counter >= end) {
		throw new RangeError('could not decode varint');
	}

	b = buf[counter++];
	res |= (b & REST) << 21;
	if (b < MSB) {
		return { value: res, nextOffset: counter };
	}

	if (counter >= end) {
		throw new RangeError('could not decode varint');
	}

	b = buf[counter++];
	res += (b & REST) * N4;
	if (b < MSB) {
		return { value: res, nextOffset: counter };
	}

	let shift = 35;
	do {
		if (counter >= end) {
			throw new RangeError('could not decode varint');
		}

		b = buf[counter++];
		res += (b & REST) * 2 ** shift;
		shift += 7;
	} while (b >= MSB);

	return { value: res, nextOffset: counter };
};

/**
 * Returns encoding length
 * @param num The number to encode
 * @returns Amount of bytes needed for encoding
 */
export const encodingLength = (num: number): number => {
	return num < N1
		? 1
		: num < N2
			? 2
			: num < N3
				? 3
				: num < N4
					? 4
					: num < N5
						? 5
						: num < N6
							? 6
							: num < N7
								? 7
								: num < N8
									? 8
									: num < N9
										? 9
										: 10;
};
