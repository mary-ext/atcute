import { BytesWrapper, fromBytes, type Bytes } from './bytes.js';
import { CIDLinkWrapper, fromCIDLink, type CIDLink } from './cid-link.js';

const CHUNK_SIZE = 1024;

const utf8e = new TextEncoder();

interface State {
	c: Uint8Array[];
	b: ArrayBuffer;
	v: DataView;
	p: number;
}

const resizeIfNeeded = (state: State, needed: number): void => {
	const buf = state.b;
	const pos = state.p;

	if (buf.byteLength < pos + needed) {
		state.c.push(new Uint8Array(buf, 0, pos));

		state.b = new ArrayBuffer(Math.max(CHUNK_SIZE, needed));
		state.v = new DataView(state.b);
		state.p = 0;
	}
};

const getInfo = (arg: number): number => {
	if (arg < 24) {
		return arg;
	} else if (arg < 0x100) {
		return 24;
	} else if (arg < 0x10000) {
		return 25;
	} else if (arg < 0x100000000) {
		return 26;
	} else {
		return 27;
	}
};

const writeFloat64 = (state: State, val: number): void => {
	resizeIfNeeded(state, 8);

	state.v.setFloat64(state.p, val);
	state.p += 8;
};

const writeUint8 = (state: State, val: number): void => {
	resizeIfNeeded(state, 1);

	state.v.setUint8(state.p, val);
	state.p += 1;
};

const writeUint16 = (state: State, val: number): void => {
	resizeIfNeeded(state, 2);

	state.v.setUint16(state.p, val);
	state.p += 2;
};

const writeUint32 = (state: State, val: number): void => {
	resizeIfNeeded(state, 4);

	state.v.setUint32(state.p, val);
	state.p += 4;
};

const writeUint64 = (state: State, val: number): void => {
	const hi = (val / 2 ** 32) | 0;
	const lo = val >>> 0;

	resizeIfNeeded(state, 8);

	state.v.setUint32(state.p, hi);
	state.v.setUint32(state.p + 4, lo);
	state.p += 8;
};

const writeTypeAndArgument = (state: State, type: number, arg: number): void => {
	const info = getInfo(arg);

	writeUint8(state, (type << 5) | info);

	switch (info) {
		case 24:
			return writeUint8(state, arg);
		case 25:
			return writeUint16(state, arg);
		case 26:
			return writeUint32(state, arg);
		case 27:
			return writeUint64(state, arg);
	}
};

const writeInteger = (state: State, val: number): void => {
	if (val < 0) {
		writeTypeAndArgument(state, 1, -val - 1);
	} else {
		writeTypeAndArgument(state, 0, val);
	}
};

const writeFloat = (state: State, val: number): void => {
	writeUint8(state, 0xe0 | 27);
	writeFloat64(state, val);
};

const writeNumber = (state: State, val: number): void => {
	if (Number.isNaN(val)) {
		throw new RangeError(`NaN values not supported`);
	}

	if (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) {
		throw new RangeError(`can't encode numbers beyond safe integer range`);
	}

	if (Number.isInteger(val)) {
		writeInteger(state, val);
	} else {
		writeFloat(state, val);
	}
};

const writeString = (state: State, val: string): void => {
	const buf = utf8e.encode(val);
	const len = buf.byteLength;

	writeTypeAndArgument(state, 3, len);
	resizeIfNeeded(state, len);

	new Uint8Array(state.b, state.p).set(buf);

	state.p += len;
};

const writeBytes = (state: State, val: Bytes): void => {
	const buf = fromBytes(val);
	const len = buf.byteLength;

	writeTypeAndArgument(state, 2, len);
	resizeIfNeeded(state, len);

	new Uint8Array(state.b, state.p, len).set(buf);

	state.p += len;
};

const writeCid = (state: State, val: CIDLink): void => {
	// CID bytes are prefixed with 0x00 for historical reasons, apparently.
	const buf = fromCIDLink(val).bytes;
	const len = buf.byteLength + 1;

	writeTypeAndArgument(state, 6, 42);
	writeTypeAndArgument(state, 2, len);

	resizeIfNeeded(state, len);

	new Uint8Array(state.b, state.p + 1, len - 1).set(buf);

	state.p += len;
};

const writeValue = (state: State, val: any): void => {
	if (val === undefined) {
		throw new TypeError(`undefined values not supported`);
	}

	if (val === null) {
		return writeUint8(state, 0xf6);
	}

	if (val === false) {
		return writeUint8(state, 0xf4);
	}

	if (val === true) {
		return writeUint8(state, 0xf5);
	}

	if (typeof val === 'number') {
		return writeNumber(state, val);
	}

	if (typeof val === 'string') {
		return writeString(state, val);
	}

	if (typeof val === 'object') {
		if (isArray(val)) {
			const len = val.length;

			writeTypeAndArgument(state, 4, len);

			for (let idx = 0; idx < len; idx++) {
				const v = val[idx];
				writeValue(state, v);
			}

			return;
		}

		if ('$link' in val) {
			if (val instanceof CIDLinkWrapper || typeof val.$link === 'string') {
				writeCid(state, val);
				return;
			}

			throw new TypeError(`unexpected cid-link value`);
		}

		if ('$bytes' in val) {
			if (val instanceof BytesWrapper || typeof val.$bytes === 'string') {
				writeBytes(state, val);
				return;
			}

			throw new TypeError(`unexpected bytes value`);
		}

		if (isPlainObject(val)) {
			const keys = Object.keys(val)
				.filter((key) => typeof key === 'string' && val[key] !== undefined)
				.sort(compareKeys);

			const len = keys.length;

			writeTypeAndArgument(state, 5, len);

			for (let idx = 0; idx < len; idx++) {
				const key = keys[idx];

				writeString(state, key);
				writeValue(state, val[key]);
			}

			return;
		}
	}

	throw new TypeError(`unsupported type: ${val}`);
};

const createState = (): State => {
	const buf = new ArrayBuffer(CHUNK_SIZE);

	return {
		c: [],
		b: buf,
		v: new DataView(buf),
		p: 0,
	};
};

export const encode = (value: any): Uint8Array => {
	const state = createState();
	const chunks = state.c;

	writeValue(state, value);
	chunks.push(new Uint8Array(state.b, 0, state.p));

	let size = 0;
	let written = 0;

	let len = chunks.length;
	let idx: number;

	for (idx = 0; idx < len; idx++) {
		size += chunks[idx].byteLength;
	}

	const u8 = new Uint8Array(size);

	for (idx = 0; idx < len; idx++) {
		const chunk = chunks[idx];

		u8.set(chunk, written);
		written += chunk.byteLength;
	}

	return u8;
};

const isArray = Array.isArray;
const isPlainObject = (v: any): boolean => {
	if (typeof v !== 'object' || v === null) {
		return false;
	}

	const proto = Object.getPrototypeOf(v);
	return proto === Object.prototype || proto === null;
};

const compareKeys = (a: string, b: string): number => {
	if (a.length < b.length) {
		return -1;
	} else if (b.length < a.length) {
		return 1;
	} else {
		return a < b ? -1 : 1;
	}
};
