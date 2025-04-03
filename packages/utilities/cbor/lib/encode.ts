import { CidLinkWrapper, fromString, type CidLink } from '@atcute/cid';
import { allocUnsafe, concat, encodeUtf8Into } from '@atcute/uint8array';

import { BytesWrapper, fromBytes, type Bytes } from './bytes.js';

const MAX_TYPE_ARG_LEN = 9;
const CHUNK_SIZE = 1024;

interface State {
	c: Uint8Array[];
	b: Uint8Array;
	v: DataView | null;
	p: number;
	l: number;
}

const _max = Math.max;

const _isInteger = Number.isInteger;
const _isNaN = Number.isNaN;

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;

const resizeIfNeeded = (state: State, needed: number): void => {
	const buf = state.b;
	const pos = state.p;

	if (buf.byteLength < pos + needed) {
		state.c.push(buf.subarray(0, pos));
		state.l += pos;

		state.b = allocUnsafe(_max(CHUNK_SIZE, needed));
		state.v = null;
		state.p = 0;
	}
};

const getTypeInfoLength = (arg: number): number => {
	return arg < 24 ? 1 : arg < 0x100 ? 2 : arg < 0x10000 ? 3 : arg < 0x100000000 ? 5 : 9;
};

const writeFloat64 = (state: State, val: number): void => {
	const buf = state.b;
	const view = (state.v ??= new DataView(buf.buffer, buf.byteOffset, buf.byteLength));

	view.setFloat64(state.p, val);
	state.p += 8;
};

const writeUint8 = (state: State, val: number): void => {
	state.b[state.p++] = val;
};

const writeUint16 = (state: State, val: number): void => {
	let pos = state.p;

	const buf = state.b;

	buf[pos++] = val >>> 8;
	buf[pos++] = val & 0xff;

	state.p = pos;
};

const writeUint32 = (state: State, val: number): void => {
	let pos = state.p;

	const buf = state.b;

	buf[pos++] = val >>> 24;
	buf[pos++] = (val >>> 16) & 0xff;
	buf[pos++] = (val >>> 8) & 0xff;
	buf[pos++] = val & 0xff;

	state.p = pos;
};

const writeUint53 = (state: State, val: number): void => {
	let pos = state.p;

	const buf = state.b;

	const hi = (val / 2 ** 32) | 0;
	const lo = val >>> 0;

	buf[pos++] = hi >>> 24;
	buf[pos++] = (hi >>> 16) & 0xff;
	buf[pos++] = (hi >>> 8) & 0xff;
	buf[pos++] = hi & 0xff;

	buf[pos++] = lo >>> 24;
	buf[pos++] = (lo >>> 16) & 0xff;
	buf[pos++] = (lo >>> 8) & 0xff;
	buf[pos++] = lo & 0xff;

	state.p = pos;
};

const writeTypeAndArgument = (state: State, type: number, arg: number): void => {
	if (arg < 24) {
		writeUint8(state, (type << 5) | arg);
	} else if (arg < 0x100) {
		writeUint8(state, (type << 5) | 24);
		writeUint8(state, arg);
	} else if (arg < 0x10000) {
		writeUint8(state, (type << 5) | 25);
		writeUint16(state, arg);
	} else if (arg < 0x100000000) {
		writeUint8(state, (type << 5) | 26);
		writeUint32(state, arg);
	} else {
		writeUint8(state, (type << 5) | 27);
		writeUint53(state, arg);
	}
};

// --- Functions below MUST be cautious about ensuring there's enough room in the buffer!!

const writeInteger = (state: State, val: number): void => {
	resizeIfNeeded(state, MAX_TYPE_ARG_LEN);

	if (val < 0) {
		writeTypeAndArgument(state, 1, -val - 1);
	} else {
		writeTypeAndArgument(state, 0, val);
	}
};

const writeFloat = (state: State, val: number): void => {
	resizeIfNeeded(state, 9);

	writeUint8(state, 0xe0 | 27);
	writeFloat64(state, val);
};

const writeNumber = (state: State, val: number): void => {
	if (_isNaN(val)) {
		throw new RangeError(`NaN values not supported`);
	}

	if (val > MAX_SAFE_INTEGER || val < MIN_SAFE_INTEGER) {
		throw new RangeError(`can't encode numbers beyond safe integer range`);
	}

	if (_isInteger(val)) {
		writeInteger(state, val);
	} else {
		// Note: https://atproto.com/specs/data-model#:~:text=not%20allowed%20in%20atproto
		writeFloat(state, val);
	}
};

const writeString = (state: State, val: string): void => {
	// JS strings are UTF-16 (ECMA spec)
	// Therefore, worst case length of UTF-8 is length * 3. (plus 9 bytes of CBOR header)
	// Greatly overshoots in practice, but doesn't matter. (alloc is O(1)+ anyway)
	const strLength = val.length;
	resizeIfNeeded(state, strLength * 3 + MAX_TYPE_ARG_LEN);

	// Credit: method used by cbor-x
	// Rather than allocate a buffer and then copy it back to the destination buffer:
	// - Estimate the length of the header based on the UTF-16 size of the string.
	//   Should be accurate most of the time, see last point for when it isn't.
	// - Directly write the string at the estimated location, retrieving with it the actual length.
	// - Write the header now that the length is available.
	//   - If the estimation happened to be wrong, correct the placement of the string.
	//     While it's costly, it's actually roughly the same cost as if we encoded it separately + copy.
	const estimatedHeaderSize = getTypeInfoLength(strLength);
	const estimatedPosition = state.p + estimatedHeaderSize;
	const len = encodeUtf8Into(state.b, val, estimatedPosition);

	const headerSize = getTypeInfoLength(len);
	if (estimatedHeaderSize !== headerSize) {
		// Estimation was incorrect, move the bytes to the real place.
		state.b.copyWithin(state.p + headerSize, estimatedPosition, estimatedPosition + len);
	}

	writeTypeAndArgument(state, 3, len);
	state.p += len;
};

const writeBytes = (state: State, val: Bytes): void => {
	const buf = fromBytes(val);
	const len = buf.byteLength;

	resizeIfNeeded(state, len + MAX_TYPE_ARG_LEN);

	writeTypeAndArgument(state, 2, len);
	state.b.set(buf, state.p);
	state.p += len;
};

const writeCid = (state: State, val: CidLink): void => {
	// CID bytes are prefixed with 0x00 for historical reasons, apparently.

	const buf = val instanceof CidLinkWrapper ? val.bytes : fromString(val.$link).bytes;
	const len = buf.byteLength + 1;

	resizeIfNeeded(state, len + 2 * MAX_TYPE_ARG_LEN);

	writeTypeAndArgument(state, 6, 42);
	writeTypeAndArgument(state, 2, len);

	state.b[state.p] = 0;
	state.b.set(buf, state.p + 1);

	state.p += len;
};

const writeValue = (state: State, val: any): void => {
	switch (typeof val) {
		case 'boolean': {
			resizeIfNeeded(state, 1);
			return writeUint8(state, 0xf4 + +val);
		}
		case 'number': {
			return writeNumber(state, val);
		}
		case 'string': {
			return writeString(state, val);
		}
		case 'object': {
			// case: null
			if (val === null) {
				resizeIfNeeded(state, 1);
				return writeUint8(state, 0xf6);
			}

			// case: array
			if (Array.isArray(val)) {
				const len = val.length;
				resizeIfNeeded(state, MAX_TYPE_ARG_LEN);
				writeTypeAndArgument(state, 4, len);

				for (let idx = 0; idx < len; idx++) {
					writeValue(state, val[idx]);
				}

				return;
			}

			// case: cid-link
			if ('$link' in val) {
				if (val instanceof CidLinkWrapper || typeof val.$link === 'string') {
					writeCid(state, val);
					return;
				}

				throw new TypeError(`unexpected cid-link value`);
			}

			// case: bytes
			if ('$bytes' in val) {
				if (val instanceof BytesWrapper || typeof val.$bytes === 'string') {
					writeBytes(state, val);
					return;
				}

				throw new TypeError(`unexpected bytes value`);
			}

			// case: POJO
			if (val.constructor === Object) {
				const keys = getOrderedObjectKeys(val);
				const len = keys.length;

				resizeIfNeeded(state, MAX_TYPE_ARG_LEN);
				writeTypeAndArgument(state, 5, len);

				for (let idx = 0; idx < len; idx++) {
					const key = keys[idx];

					writeString(state, key);
					writeValue(state, val[key]);
				}

				return;
			}
		}
	}

	throw new TypeError(`unsupported type: ${val}`);
};

const createState = (): State => {
	return {
		c: [],
		b: allocUnsafe(CHUNK_SIZE),
		v: null,
		p: 0,
		l: 0,
	};
};

export const encode = (value: any): Uint8Array => {
	const state = createState();

	writeValue(state, value);

	state.c.push(state.b.subarray(0, state.p));
	return concat(state.c, state.l + state.p);
};

/** @internal */
export const getOrderedObjectKeys = (obj: Record<string, unknown>): string[] => {
	const keys = Object.keys(obj);
	for (let i = 1, len = keys.length, j = 0; i < len; j = i++) {
		const valA = keys[i];

		// Tuck in undefined value filtering here to avoid extra iterations.
		if (obj[valA] === undefined) {
			// A lot of things are tucked in here xd
			// - Pull the currently last item in the keys array at the current place
			// - Update saved value of array length
			// - Decrease i by 1
			keys[i--] = keys[--len];
			keys.length = len;
		} else {
			for (; j >= 0; j--) {
				const valB = keys[j];

				// Note: Don't need to check for equality, keys are always distinct.
				const cmp = valA.length - valB.length || +(valA > valB);
				if (cmp > 0) break;

				keys[j + 1] = valB;
			}

			keys[j + 1] = valA;
		}
	}

	return keys;
};
