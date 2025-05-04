import { fromBase64, toBase64 } from '@atcute/multibase';

export interface Bytes {
	$bytes: string;
}

const BYTES_SYMBOL = Symbol.for('@atcute/bytes-wrapper');

export class BytesWrapper implements Bytes {
	/** @internal */
	readonly [BYTES_SYMBOL] = true;

	constructor(public buf: Uint8Array) {}

	get $bytes(): string {
		return toBase64(this.buf);
	}

	toJSON(): Bytes {
		return { $bytes: this.$bytes };
	}
}

export const toBytes = (buf: Uint8Array): Bytes => {
	return new BytesWrapper(buf);
};

export const fromBytes = (bytes: Bytes): Uint8Array => {
	if (bytes instanceof BytesWrapper) {
		return bytes.buf;
	}

	return fromBase64(bytes.$bytes);
};
