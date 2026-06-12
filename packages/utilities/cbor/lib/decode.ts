// oxlint-disable typescript/no-explicit-any

import { type CidLink, CidLinkWrapper, fromBinary } from '@atcute/cid';
import { decodeUtf8From } from '@atcute/uint8array';

import { type Bytes, toBytes } from './bytes.ts';

interface State {
	b: Uint8Array;
	v: DataView | null;
	p: number;
	/** byte offset of the last decoded map key (for canonical-order comparison) */
	ks: number;
	/** byte length of the last decoded map key */
	kl: number;
}

const requireBytes = (state: State, needed: number): void => {
	if (needed > state.b.length - state.p) {
		throw new RangeError(`unexpected end of input`);
	}
};

const readArgument = (state: State, info: number): number => {
	if (info < 24) {
		return info;
	}

	let arg: number;
	switch (info) {
		case 24: {
			requireBytes(state, 1);
			arg = readUint8(state);
			if (arg < 24) {
				throw new TypeError(`non-canonical argument encoding`);
			}
			break;
		}
		case 25: {
			requireBytes(state, 2);
			arg = readUint16(state);
			if (arg < 0x100) {
				throw new TypeError(`non-canonical argument encoding`);
			}
			break;
		}
		case 26: {
			requireBytes(state, 4);
			arg = readUint32(state);
			if (arg < 0x10000) {
				throw new TypeError(`non-canonical argument encoding`);
			}
			break;
		}
		case 27: {
			requireBytes(state, 8);
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
	requireBytes(state, 8);

	const view = (state.v ??= new DataView(state.b.buffer, state.b.byteOffset, state.b.byteLength));
	const value = view.getFloat64(state.p);

	// DRISL forbids NaN and infinities; -0 and subnormals are finite and remain allowed.
	if (!Number.isFinite(value)) {
		throw new RangeError(`NaN and Infinity values not supported`);
	}

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
	requireBytes(state, length);

	const string = decodeUtf8From(state.b, state.p, length);
	state.p += length;

	return string;
};

const readBytes = (state: State, length: number): Bytes => {
	requireBytes(state, length);

	const slice = state.b.subarray(state.p, (state.p += length));

	return toBytes(slice);
};

const readCid = (state: State, length: number): CidLink => {
	requireBytes(state, length);

	const cid = fromBinary(state.b.subarray(state.p, (state.p += length)));

	return new CidLinkWrapper(cid.bytes);
};

const decodeStringKey = (state: State): string => {
	requireBytes(state, 1);

	const prelude = readUint8(state);

	const type = prelude >> 5;
	if (type !== 3) {
		throw new TypeError(`expected map to only have string keys; got type ${type}`);
	}

	const info = prelude & 0x1f;
	const length = info < 24 ? info : readArgument(state, info);

	state.ks = state.p;
	state.kl = length;
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
			/** byte offset of the held key (for canonical-order comparison) */
			ks: number;
			/** byte length of the held key */
			kl: number;
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
		ks: 0,
		kl: 0,
	};

	let stack: Container | null = null;
	let value: any;

	jump: while (state.p < len) {
		// the loop condition guarantees the prelude byte; deeper reads guard themselves via requireBytes
		const prelude = readUint8(state);

		const type = prelude >> 5;
		const info = prelude & 0x1f;
		const arg = type === 7 ? 0 : info < 24 ? info : readArgument(state, info);

		switch (type) {
			case 0: {
				value = arg;
				break;
			}
			case 1: {
				value = -1 - arg;
				// `readUint53` caps the argument at the safe-integer range, but negation shifts the
				// lower bound by one, so -(2^53) can slip through; reject it to match the encoder.
				if (value < Number.MIN_SAFE_INTEGER) {
					throw new RangeError(`can't decode integers beyond safe integer range`);
				}
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
					// each element needs at least one byte, so reject lengths larger than the remaining
					// input before allocating — a truncated header must not force a huge allocation.
					requireBytes(state, arg);

					// oxlint-disable-next-line no-new-array
					stack = { t: 1, c: (value = new Array(arg)), k: null, r: arg, n: stack };
					continue jump;
				}

				value = [];
				break;
			}
			case 5: {
				value = {};
				if (arg > 0) {
					// We'll read the key of the first item here.
					const first = decodeStringKey(state);

					stack = { t: 0, c: value, k: first, ks: state.ks, kl: state.kl, r: arg, n: stack };
					continue jump;
				}
				break;
			}
			case 6: {
				switch (arg) {
					case 42: {
						requireBytes(state, 1);

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
					const prevStart = stack.ks;
					const prevLength = stack.kl;

					stack.k = decodeStringKey(state);

					const curStart = state.ks;
					const curLength = state.kl;

					// Canonical CBOR orders map keys by UTF-8 byte length, then bytewise on the raw
					// UTF-8 bytes. Comparing the buffer slices directly avoids the UTF-16 semantics
					// of JS string comparison, which diverges for non-ASCII keys.
					let cmp = curLength - prevLength;
					if (cmp === 0) {
						const buf = state.b;
						for (let i = 0; i < curLength; i++) {
							cmp = buf[curStart + i] - buf[prevStart + i];
							if (cmp !== 0) {
								break;
							}
						}
					}

					if (cmp <= 0) {
						throw new TypeError(`map keys are not in canonical order or contain duplicates`);
					}

					stack.ks = curStart;
					stack.kl = curLength;
				}

				continue jump;
			}

			// Unwrap the stack
			value = stack.c;
			stack = stack.n;
		}

		// a complete value: returning here means falling out of the loop can only happen when the
		// input ends mid-structure (or is empty), which the throw below reports.
		return [value, buf.subarray(state.p)];
	}

	throw new RangeError(`unexpected end of input`);
};

export const decode = (buf: Uint8Array): any => {
	const [value, remainder] = decodeFirst(buf);
	if (remainder.length !== 0) {
		throw new Error(`decoded value contains remainder`);
	}

	return value;
};
