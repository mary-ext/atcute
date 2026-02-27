import { fromBase64, toBase64 } from '@atcute/multibase';

export interface Bytes {
	$bytes: string;
}

const BYTES_SYMBOL = Symbol.for('@atcute/bytes-wrapper');

export class BytesWrapper implements Bytes {
	/** @internal */
	readonly [BYTES_SYMBOL] = true;

	buf: Uint8Array;

	constructor(buf: Uint8Array) {
		this.buf = buf;
	}

	get $bytes(): string {
		return toBase64(this.buf);
	}

	toJSON(): Bytes {
		return { $bytes: this.$bytes };
	}
}

export const isBytes = (value: unknown): value is Bytes => {
	const val = value as any;

	return (
		val instanceof BytesWrapper || (val !== null && typeof val === 'object' && typeof val.$bytes === 'string')
	);
};

export const toBytes = (buf: Uint8Array): Bytes => {
	return new BytesWrapper(buf);
};

export const fromBytes = (bytes: Bytes): Uint8Array => {
	if (bytes instanceof BytesWrapper) {
		return bytes.buf;
	}

	return fromBase64(bytes.$bytes);
};
