/**
 * represents an object containing raw binary data encoded as a base64 string
 */
export interface Bytes {
	$bytes: string;
}

const BYTES_SYMBOL = Symbol.for('@atcute/bytes-wrapper');

/**
 * this should match with {@link file://./../../../../utilities/cbor/lib/bytes.ts}
 * @internal
 */
export interface _BytesWrapper {
	readonly [BYTES_SYMBOL]: true;

	readonly buf: Uint8Array;
	readonly $bytes: string;

	toJSON(): Bytes;
}

/**
 * @internal
 */
export const _isBytesWrapper = (input: unknown): input is _BytesWrapper => {
	return typeof input === 'object' && input !== null && BYTES_SYMBOL in input;
};

export const isBytes = (input: unknown): input is Bytes => {
	const v = input as any;

	return typeof v === 'object' && v !== null && (BYTES_SYMBOL in v || typeof v.$bytes === 'string');
};
