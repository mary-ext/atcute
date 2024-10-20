import { toBytes, type Bytes } from './bytes.js';
import { toCIDLink, type CIDLink } from './cid-link.js';

const utf8d = new TextDecoder();

interface State {
	b: Uint8Array;
	v: DataView;
	p: number;
}

const readArgument = (state: State, info: number): number => {
	if (info < 24) {
		return info;
	}

	switch (info) {
		case 24:
			return readUint8(state);
		case 25:
			return readUint16(state);
		case 26:
			return readUint32(state);
		case 27:
			return readUint64(state);
	}

	throw new Error(`invalid argument encoding; got ${info}`);
};

const readFloat64 = (state: State): number => {
	const value = state.v.getFloat64(state.p);

	state.p += 8;
	return value;
};

const readUint8 = (state: State): number => {
	const value = state.v.getUint8(state.p);

	state.p += 1;
	return value;
};

const readUint16 = (state: State): number => {
	const value = state.v.getUint16(state.p);

	state.p += 2;
	return value;
};

const readUint32 = (state: State): number => {
	const value = state.v.getUint32(state.p);

	state.p += 4;
	return value;
};

const readUint64 = (state: State): number => {
	const hi = state.v.getUint32(state.p);
	const lo = state.v.getUint32(state.p + 4);

	if (hi > 0x1fffff) {
		throw new RangeError(`can't decode integers beyond safe integer range`);
	}

	// prettier-ignore
	const value = (hi * (2 ** 32)) + lo;

	state.p += 8;
	return value;
};

const readString = (state: State, length: number): string => {
	const slice = state.b.subarray(state.p, (state.p += length));

	return utf8d.decode(slice);
};

const readBytes = (state: State, length: number): Bytes => {
	const slice = state.b.subarray(state.p, (state.p += length));

	return toBytes(slice);
};

const readCid = (state: State, length: number): CIDLink => {
	// CID bytes are prefixed with 0x00 for historical reasons, apparently.
	const slice = state.b.subarray(state.p + 1, (state.p += length));

	return toCIDLink(slice);
};

const readValue = (state: State): any => {
	const prelude = readUint8(state);

	const type = prelude >> 5;
	const info = prelude & 0x1f;

	if (type === 0) {
		const value = readArgument(state, info);
		return value;
	}

	if (type === 1) {
		const value = readArgument(state, info);
		return -1 - value;
	}

	if (type === 2) {
		const len = readArgument(state, info);
		return readBytes(state, len);
	}

	if (type === 3) {
		const len = readArgument(state, info);

		return readString(state, len);
	}

	if (type === 4) {
		const len = readArgument(state, info);
		const array = new Array(len);

		for (let idx = 0; idx < len; idx++) {
			array[idx] = readValue(state);
		}

		return array;
	}

	if (type === 5) {
		const len = readArgument(state, info);
		const object: Record<string, unknown> = {};

		for (let idx = 0; idx < len; idx++) {
			const key = readValue(state);
			if (typeof key !== 'string') {
				throw new TypeError(`expected map to only have string keys; got ${typeof key}`);
			}

			object[key] = readValue(state);
		}

		return object;
	}

	if (type === 6) {
		const tag = readArgument(state, info);

		if (tag === 42) {
			const prelude = readUint8(state);

			const type = prelude >> 5;
			const info = prelude & 0x1f;

			if (type !== 2) {
				throw new TypeError(`expected cid tag to have bytes value; got ${type}`);
			}

			const len = readArgument(state, info);

			return readCid(state, len);
		}

		throw new TypeError(`unsupported tag; got ${tag}`);
	}

	if (type === 7) {
		switch (info) {
			case 20:
				return false;
			case 21:
				return true;
			case 22:
				return null;
			case 27:
				return readFloat64(state);
		}

		throw new Error(`invalid simple value; got ${info}`);
	}

	throw new TypeError(`invalid type; got ${type}`);
};

export const decodeFirst = (buf: Uint8Array): [value: any, remainder: Uint8Array] => {
	const state: State = {
		b: buf,
		v: new DataView(buf.buffer, buf.byteOffset, buf.byteLength),
		p: 0,
	};

	const value = readValue(state);
	const remainder = buf.subarray(state.p);

	return [value, remainder];
};

export const decode = (buf: Uint8Array): any => {
	const [value, remainder] = decodeFirst(buf);
	if (remainder.length !== 0) {
		throw new Error(`decoded value contains remainder`);
	}

	return value;
};
