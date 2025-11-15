import { CidLinkWrapper, fromBinary, type CidLink } from '@atcute/cid';
import { decodeUtf8From } from '@atcute/uint8array';

import { toBytes, type Bytes } from './bytes.js';

interface State {
	b: Uint8Array;
	v: DataView | null;
	p: number;
}

const readArgument = (state: State, info: number): number => {
	if (info < 24) {
		return info;
	}

	let arg: number;
	switch (info) {
		case 24: {
			arg = readUint8(state);
			if (arg < 24) {
				throw new TypeError(`non-canonical argument encoding`);
			}
			break;
		}
		case 25: {
			arg = readUint16(state);
			if (arg < 0x100) {
				throw new TypeError(`non-canonical argument encoding`);
			}
			break;
		}
		case 26: {
			arg = readUint32(state);
			if (arg < 0x10000) {
				throw new TypeError(`non-canonical argument encoding`);
			}
			break;
		}
		case 27: {
			arg = readUint53(state);
			if (arg < 0x100000000) {
				throw new TypeError(`non-canonical argument encoding`);
			}
			break;
		}
		default: {
			throw new Error(`invalid argument encoding; got ${info}`);
		}
	}
	return arg;
};

const readFloat64 = (state: State): number => {
	const view = (state.v ??= new DataView(state.b.buffer, state.b.byteOffset, state.b.byteLength));
	const value = view.getFloat64(state.p);

	state.p += 8;
	return value;
};

const readUint8 = (state: State): number => {
	return state.b[state.p++];
};

const readUint16 = (state: State): number => {
	let pos = state.p;

	const buf = state.b;
	const value = (buf[pos++] << 8) | buf[pos++];

	state.p = pos;
	return value;
};

const readUint32 = (state: State): number => {
	let pos = state.p;

	const buf = state.b;
	const value = ((buf[pos++] << 24) | (buf[pos++] << 16) | (buf[pos++] << 8) | buf[pos++]) >>> 0;

	state.p = pos;
	return value;
};

const readUint53 = (state: State): number => {
	const hi = readUint32(state);
	const lo = readUint32(state);

	if (hi > 0x1fffff) {
		throw new RangeError(`can't decode integers beyond safe integer range`);
	}

	return hi * 2 ** 32 + lo;
};

const readString = (state: State, length: number): string => {
	const string = decodeUtf8From(state.b, state.p, length);
	state.p += length;

	return string;
};

const readBytes = (state: State, length: number): Bytes => {
	const slice = state.b.subarray(state.p, (state.p += length));

	return toBytes(slice);
};

const readCid = (state: State, length: number): CidLink => {
	const cid = fromBinary(state.b.subarray(state.p, (state.p += length)));

	return new CidLinkWrapper(cid.bytes);
};

const compareKeys = (a: string, b: string): number => {
	return a.length - b.length || (a < b ? -1 : a > b ? 1 : 0);
};

const decodeStringKey = (state: State): string => {
	const prelude = readUint8(state);

	const type = prelude >> 5;
	if (type !== 3) {
		throw new TypeError(`expected map to only have string keys; got type ${type}`);
	}

	const info = prelude & 0x1f;
	const length = readArgument(state, info);
	return readString(state, length);
};

type Container =
	| {
			/** map type */
			t: 0;
			/** container value */
			c: Record<string, unknown>;
			/** held key (as we decode the value) */
			k: string;
			/** remaining elements (key + value) */
			r: number;
			/** next container in stack */
			n: Container | null;
	  }
	| {
			/** array type */
			t: 1;
			/** container value */
			c: any[];
			/** held key (not used) */
			k: null;
			/** remaining elements (values) */
			r: number;
			/** next container in stack */
			n: Container | null;
	  };

export const decodeFirst = (buf: Uint8Array): [value: any, remainder: Uint8Array] => {
	const len = buf.length;

	const state: State = {
		b: buf,
		v: null,
		p: 0,
	};

	let stack: Container | null = null;
	let value: any;

	jump: while (state.p < len) {
		const prelude = readUint8(state);

		const type = prelude >> 5;
		const info = prelude & 0x1f;
		const arg = type === 7 ? 0 : readArgument(state, info);

		switch (type) {
			case 0: {
				value = arg;
				break;
			}
			case 1: {
				value = -1 - arg;
				break;
			}
			case 2: {
				value = readBytes(state, arg);
				break;
			}
			case 3: {
				value = readString(state, arg);
				break;
			}
			case 4: {
				if (arg > 0) {
					stack = { t: 1, c: (value = new Array(arg)), k: null, r: arg, n: stack };
					continue jump;
				}

				value = []
				break;
			}
			case 5: {
				value = {}
				if (arg > 0) {
					// We'll read the key of the first item here.
					const first = decodeStringKey(state);

					stack = { t: 0, c: value, k: first, r: arg, n: stack };
					continue jump;
				}
				break;
			}
			case 6: {
				switch (arg) {
					case 42: {
						const prelude = readUint8(state);

						const type = prelude >> 5;
						const info = prelude & 0x1f;
						if (type !== 2) {
							throw new TypeError(`expected cid-link to be type 2 (bytes); got type ${type}`);
						}

						const len = readArgument(state, info);
						value = readCid(state, len);

						break;
					}
					default: {
						throw new TypeError(`unsupported tag; got ${arg}`);
					}
				}

				break;
			}
			case 7: {
				switch (info) {
					case 20:
					case 21: {
						value = info === 21;
						break;
					}
					case 22: {
						value = null;
						break;
					}
					case 27: {
						value = readFloat64(state);
						break;
					}
					default: {
						throw new Error(`invalid simple value; got ${info}`);
					}
				}

				break;
			}
			default: {
				throw new TypeError(`invalid type; got ${type}`);
			}
		}

		while (stack !== null) {
			switch (stack.t) {
				case 0: {
					const obj = stack.c;
					const key = stack.k;

					if (key === '__proto__') {
						// Guard against prototype pollution. CWE-1321
						Object.defineProperty(obj, key, { enumerable: true, configurable: true, writable: true });
					}

					obj[key] = value;
					break;
				}
				case 1: {
					const arr = stack.c;
					const index = arr.length - stack.r;

					arr[index] = value;
					break;
				}
			}

			if (--stack.r) {
				// We still have more values to decode, continue

				if (!stack.t) {
					// Read the key of the next map item
					const prevKey = stack.k;
					stack.k = decodeStringKey(state);

					if (compareKeys(stack.k, prevKey) <= 0) {
						throw new TypeError(`map keys are not in canonical order or contain duplicates`);
					}
				}

				continue jump;
			}

			// Unwrap the stack
			value = stack.c;
			stack = stack.n;
		}

		break;
	}

	return [value, buf.subarray(state.p)];
};

export const decode = (buf: Uint8Array): any => {
	const [value, remainder] = decodeFirst(buf);
	if (remainder.length !== 0) {
		throw new Error(`decoded value contains remainder`);
	}

	return value;
};
