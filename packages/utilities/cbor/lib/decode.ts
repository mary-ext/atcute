import { getFloat16 } from 'fp16';

import { toBytes, type Bytes } from './bytes.js';
import { toCIDLink, type CIDLink } from './cid-link.js';

const utf8d = new TextDecoder();

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
const MIN_SAFE_INTEGER = BigInt(Number.MIN_SAFE_INTEGER);

interface State {
	b: Uint8Array;
	v: DataView;
	p: number;
}

const readArgument = (state: State, info: number): [val: number, uint64: bigint | undefined] => {
	if (info < 24) {
		return [info, undefined];
	}

	switch (info) {
		case 24: {
			return [readUint8(state), undefined];
		}
		case 25: {
			return [readUint16(state), undefined];
		}
		case 26: {
			return [readUint32(state), undefined];
		}
		case 27: {
			const uint64 = readUint64(state);
			const value = MAX_SAFE_INTEGER < uint64 ? Infinity : Number(uint64);

			return [value, uint64];
		}
	}

	throw new Error(`invalid argument encoding; got ${info}`);
};

const readFloat16 = (state: State): number => {
	const value = getFloat16(state.v, state.p);

	state.p += 2;
	return value;
};

const readFloat32 = (state: State): number => {
	const value = state.v.getFloat32(state.p);

	state.p += 4;
	return value;
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

const readUint64 = (state: State): bigint => {
	const value = state.v.getBigUint64(state.p);

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
		const [val, uint64] = readArgument(state, info);

		if (uint64 !== undefined && MAX_SAFE_INTEGER < uint64) {
			throw new RangeError(`can't decode integers greater than 2^53-1`);
		}

		return val;
	}

	if (type === 1) {
		const [val, uint64] = readArgument(state, info);

		if (uint64 !== undefined && -1n - uint64 < MIN_SAFE_INTEGER) {
			throw new RangeError(`can't decode integers less than -2^53-1`);
		}

		return -1 - val;
	}

	if (type === 2) {
		const [len] = readArgument(state, info);

		return readBytes(state, len);
	}

	if (type === 3) {
		const [len] = readArgument(state, info);

		return readString(state, len);
	}

	if (type === 4) {
		const [len] = readArgument(state, info);

		const array = new Array(len);
		for (let idx = 0; idx < len; idx++) {
			array[idx] = readValue(state);
		}

		return array;
	}

	if (type === 5) {
		const [len] = readArgument(state, info);

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
		const [tag] = readArgument(state, info);

		if (tag === 42) {
			const prelude = readUint8(state);

			const type = prelude >> 5;
			const info = prelude & 0x1f;

			if (type !== 2) {
				throw new TypeError(`expected cid tag to have bytes value; got ${type}`);
			}

			const [len] = readArgument(state, info);

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
			case 23:
				return undefined;
			case 25:
				return readFloat16(state);
			case 26:
				return readFloat32(state);
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
