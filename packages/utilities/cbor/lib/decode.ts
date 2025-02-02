import { CidLinkWrapper, type CidLink } from '@atcute/cid';
import { decodeUtf8From } from '@atcute/uint8array';

import { toBytes, type Bytes } from './bytes.js';

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
		case 24: {
			return readUint8(state);
		}
		case 25: {
			return readUint16(state);
		}
		case 26: {
			return readUint32(state);
		}
		case 27: {
			return readUint53(state);
		}
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
	let pos = state.p;

	const buf = state.b;

	const hi = ((buf[pos++] << 24) | (buf[pos++] << 16) | (buf[pos++] << 8) | buf[pos++]) >>> 0;

	if (hi > 0x1fffff) {
		throw new RangeError(`can't decode integers beyond safe integer range`);
	}

	const lo = ((buf[pos++] << 24) | (buf[pos++] << 16) | (buf[pos++] << 8) | buf[pos++]) >>> 0;
	const value = hi * 2 ** 32 + lo;

	state.p = pos;
	return value;
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

const readTypeInfo = (state: State): [number, number] => {
	const prelude = readUint8(state);
	return [prelude >> 5, prelude & 0x1f];
};

const readCid = (state: State, length: number): CidLink => {
	// CID bytes are prefixed with 0x00 for historical reasons, apparently.
	const slice = state.b.subarray(state.p + 1, (state.p += length));

	return new CidLinkWrapper(slice);
};

const enum ContainerType {
	MAP,
	ARRAY,
}

type Container =
	| {
			t: ContainerType.MAP;
			c: Record<string, unknown>;
			k: string | null;
			r: number;
			n: Container | null;
	  }
	| {
			t: ContainerType.ARRAY;
			c: any[];
			k: null;
			r: number;
			n: Container | null;
	  };

export const decodeFirst = (buf: Uint8Array): [value: any, remainder: Uint8Array] => {
	const len = buf.length;

	const state: State = {
		b: buf,
		v: new DataView(buf.buffer, buf.byteOffset, buf.byteLength),
		p: 0,
	};

	let stack: Container | null = null;
	let result: any;

	jump: while (state.p < len) {
		const prelude = readUint8(state);

		const type = prelude >> 5;
		const info = prelude & 0x1f;
		const arg = type < 7 ? readArgument(state, info) : 0;

		let value: any;

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
				const arr = new Array(arg);
				value = arr;

				if (arg > 0) {
					stack = { t: ContainerType.ARRAY, c: arr, k: null, r: arg, n: stack };
					continue jump;
				}

				break;
			}
			case 5: {
				const obj: Record<string, unknown> = {};
				value = obj;

				if (arg > 0) {
					// `arg * 2` because we're reading both keys and values
					stack = { t: ContainerType.MAP, c: obj, k: null, r: arg * 2, n: stack };
					continue jump;
				}

				break;
			}
			case 6: {
				switch (arg) {
					case 42: {
						const [type, info] = readTypeInfo(state);
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
			const node = stack;

			switch (node.t) {
				case ContainerType.ARRAY: {
					const index = node.c.length - node.r;
					node.c[index] = value;

					break;
				}
				case ContainerType.MAP: {
					if (node.k === null) {
						if (typeof value !== 'string') {
							throw new TypeError(`expected map to only have string keys; got ${type}`);
						}

						node.k = value;
					} else if (node.k !== '__proto__') {
						node.c[node.k] = value;
						node.k = null;
					} else {
						// Guard against prototype pollution. CWE-1321
						Object.defineProperty(node.c, node.k, { enumerable: true, configurable: true, writable: true });
						node.k = null;
					}

					break;
				}
			}

			if (--node.r !== 0) {
				// We still have more values to decode, continue
				continue jump;
			}

			// Unwrap the stack
			value = node.c;
			stack = node.n;
		}

		result = value;
		break;
	}

	return [result, buf.subarray(state.p)];
};

export const decode = (buf: Uint8Array): any => {
	const [value, remainder] = decodeFirst(buf);
	if (remainder.length !== 0) {
		throw new Error(`decoded value contains remainder`);
	}

	return value;
};
