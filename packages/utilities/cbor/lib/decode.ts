import { CidLinkWrapper, type CidLink } from '@atcute/cid';
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

const readCid = (state: State, length: number): CidLink => {
	// CID bytes are prefixed with 0x00 for historical reasons, apparently.
	const slice = state.b.subarray(state.p + 1, (state.p += length));

	return new CidLinkWrapper(slice);
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

		switch (type) {
			case 0: {
				value = readArgument(state, info);
				break;
			}
			case 1: {
				value = -1 - readArgument(state, info);
				break;
			}
			case 2: {
				value = readBytes(state, readArgument(state, info));
				break;
			}
			case 3: {
				value = readString(state, readArgument(state, info));
				break;
			}
			case 4: {
				const len = readArgument(state, info);
				const arr = new Array(len);
				value = arr;

				if (len > 0) {
					stack = { t: 1, c: arr, k: null, r: len, n: stack };
					continue jump;
				}

				break;
			}
			case 5: {
				const len = readArgument(state, info);
				const obj: Record<string, unknown> = {};
				value = obj;

				if (len > 0) {
					// We'll read the key of the first item here.
					const first = decodeStringKey(state);

					stack = { t: 0, c: obj, k: first, r: len, n: stack };
					continue jump;
				}

				break;
			}
			case 6: {
				const arg = readArgument(state, info);

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

			if (--stack.r !== 0) {
				// We still have more values to decode, continue

				if (stack.t === 0) {
					// Read the key of the next map item
					stack.k = decodeStringKey(state);
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
