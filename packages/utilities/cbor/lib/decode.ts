import { CidLinkWrapper, type CidLink } from '@atcute/cid';

import { toBytes, type Bytes } from './bytes.js';

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
	return state.b[state.p++];
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

const readTypeInfo = (state: State): [number, number] => {
	const prelude = readUint8(state);
	return [prelude >> 5, prelude & 0x1f];
};

const readCid = (state: State, length: number): CidLink => {
	// CID bytes are prefixed with 0x00 for historical reasons, apparently.
	const slice = state.b.subarray(state.p + 1, (state.p += length));

	return new CidLinkWrapper(slice);
};

const readValue = (state: State): any => {
	const prelude = readUint8(state);

	const type = prelude >> 5;
	const info = prelude & 0x1f;
	const arg = type < 7 ? readArgument(state, info) : 0;

	switch (type) {
		case 0: {
			return arg;
		}
		case 1: {
			return -1 - arg;
		}
		case 2: {
			return readBytes(state, arg);
		}
		case 3: {
			return readString(state, arg);
		}
		case 4: {
			const array = new Array(arg);

			for (let idx = 0; idx < arg; idx++) {
				array[idx] = readValue(state);
			}

			return array;
		}
		case 5: {
			const object: Record<string, unknown> = {};

			for (let idx = 0; idx < arg; idx++) {
				const [type, info] = readTypeInfo(state);
				if (type !== 3) {
					throw new TypeError(`expected map to only have string keys; got type ${type}`);
				}

				const len = readArgument(state, info);
				const key = readString(state, len);

				if (key === '__proto__')
					// Guard against prototype pollution. CWE-1321
					Object.defineProperty(object, key, { enumerable: true, configurable: true, writable: true });

				object[key] = readValue(state);
			}

			return object;
		}
		case 6: {
			if (arg === 42) {
				const [type, info] = readTypeInfo(state);
				if (type !== 2) {
					throw new TypeError(`expected cid-link to be type 2 (bytes); got type ${type}`);
				}

				const len = readArgument(state, info);
				return readCid(state, len);
			}

			throw new TypeError(`unsupported tag; got ${arg}`);
		}
		case 7: {
			switch (info) {
				case 20:
				case 21:
					return info === 21;
				case 22:
					return null;
				case 27:
					return readFloat64(state);
			}

			throw new Error(`invalid simple value; got ${info}`);
		}
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
