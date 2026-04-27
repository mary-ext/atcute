import { type CidLink, CidLinkWrapper, fromString } from '@atcute/cid';
import { allocUnsafe, concat, encodeUtf8Into } from '@atcute/uint8array';

import { IS_NODE_RUNTIME } from '#runtime';

import { type Bytes, BytesWrapper, fromBytes } from './bytes.ts';

const MAX_TYPE_ARG_LEN = 9;
const CHUNK_SIZE = 1024;

interface State {
	c: Uint8Array<ArrayBuffer>[];
	b: Uint8Array<ArrayBuffer>;
	v: DataView | null;
	p: number;
	l: number;
}

const _max = Math.max;

const _isInteger = Number.isInteger;
const _isFinite = Number.isFinite;

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
	if (!_isFinite(val)) {
		throw new RangeError(`NaN and Infinity values not supported`);
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
	const strLength = val.length;

	if (strLength === 0) {
		resizeIfNeeded(state, 1);
		writeUint8(state, 0x60);
		return;
	}

	// JS strings are UTF-16 (ECMA spec)
	// Therefore, worst case length of UTF-8 is length * 3. (plus 9 bytes of CBOR header)
	// Greatly overshoots in practice, but doesn't matter. (alloc is O(1)+ anyway)
	resizeIfNeeded(state, strLength * 3 + MAX_TYPE_ARG_LEN);

	// Optimistic fast encode
	ascii: if (!IS_NODE_RUNTIME || strLength < 24) {
		const ptr = state.p + getTypeInfoLength(strLength);
		const first = val.charCodeAt(0);
		if (first > 0x7f) {
			break ascii;
		}

		state.b[ptr] = first;
		let i = 1;

		// batch-process four characters per iteration to lower charCodeAt/branch overhead.
		for (; i + 3 < strLength; i += 4) {
			const a = val.charCodeAt(i);
			const b = val.charCodeAt(i + 1);
			const c = val.charCodeAt(i + 2);
			const d = val.charCodeAt(i + 3);

			if ((a | b | c | d) & 0x80) {
				break ascii;
			}

			state.b[ptr + i] = a;
			state.b[ptr + i + 1] = b;
			state.b[ptr + i + 2] = c;
			state.b[ptr + i + 3] = d;
		}

		for (; i < strLength; i++) {
			const code = val.charCodeAt(i);
			if (code > 0x7f) {
				break ascii;
			}

			state.b[ptr + i] = code;
		}

		// String was ASCII-only, we're done
		writeTypeAndArgument(state, 3, strLength);
		state.p += strLength;
		return;
	}

	// Credit: method used by cbor-x
	// Rather than allocate a buffer and then copy it back to the destination buffer:
	// - Estimate the length of the header based on the UTF-16 size of the string.
	//   Should be accurate enough, see last point for when it isn't.
	// - Directly write the string at the estimated location, retrieving with it the actual length.
	// - Write the header now that the length is available.
	//   - If the estimation happened to be wrong, correct the placement of the string.
	//     While it's costly, it's actually roughly the same cost as if we encoded it separately + copy.
	const estimatedHeaderSize = getTypeInfoLength(strLength * 2);
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

			// case: POJO
			if (val.constructor === Object) {
				const keys = getOrderedObjectKeys(val);
				const len = keys.length;

				if (len === 1) {
					const key = keys[0]!;

					if (key === '$link') {
						if (typeof val.$link === 'string') {
							writeCid(state, val);
							return;
						}

						throw new TypeError(`unexpected cid-link value`);
					}

					if (key === '$bytes') {
						if (typeof val.$bytes === 'string') {
							writeBytes(state, val);
							return;
						}

						throw new TypeError(`unexpected bytes value`);
					}
				}

				resizeIfNeeded(state, MAX_TYPE_ARG_LEN);
				writeTypeAndArgument(state, 5, len);

				for (let idx = 0; idx < len; idx++) {
					const key = keys[idx];

					writeString(state, key);
					writeValue(state, val[key]);
				}

				return;
			}

			// case: cid-link wrappers / odd objects
			if ('$link' in val) {
				if (val instanceof CidLinkWrapper || typeof val.$link === 'string') {
					writeCid(state, val);
					return;
				}

				throw new TypeError(`unexpected cid-link value`);
			}

			// case: bytes wrappers / odd objects
			if ('$bytes' in val) {
				if (val instanceof BytesWrapper || typeof val.$bytes === 'string') {
					writeBytes(state, val);
					return;
				}

				throw new TypeError(`unexpected bytes value`);
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

export const encode = (value: any): Uint8Array<ArrayBuffer> => {
	const state = createState();

	writeValue(state, value);

	const final = state.b.subarray(0, state.p);
	if (!state.c.length) {
		return final;
	}

	state.c.push(final);
	return concat(state.c, state.l + state.p);
};

/** @internal */
export const getOrderedObjectKeys = (obj: Record<string, unknown>): string[] => {
	const keys = Object.keys(obj);
	let len = 0;

	for (let i = 0; i < keys.length; i++) {
		const valA = keys[i];
		if (obj[valA] === undefined) {
			continue;
		}

		const lenA = valA.length;
		let j = len - 1;
		for (; j >= 0; j--) {
			const valB = keys[j];

			// Note: Don't need to check for equality, keys are always distinct.
			if (lenA > valB.length || (lenA === valB.length && valA > valB)) {
				break;
			}

			keys[j + 1] = valB;
		}

		keys[j + 1] = valA;
		len++;
	}

	keys.length = len;
	return keys;
};
