import { fromBase64, fromBase64Pad, toBase64 } from '@atcute/multibase';

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
	// oxlint-disable-next-line typescript/no-explicit-any
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

	// atproto emits unpadded base64 but the data-model permits optional padding on `$bytes`; accept
	// both while keeping the generic codecs strict.
	const $bytes = bytes.$bytes;
	return $bytes.charCodeAt($bytes.length - 1) === 0x3d ? fromBase64Pad($bytes) : fromBase64($bytes);
};
