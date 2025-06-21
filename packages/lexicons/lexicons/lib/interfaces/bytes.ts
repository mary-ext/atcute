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
// #__NO_SIDE_EFFECTS__
export const _isBytesWrapper = (input: unknown): input is _BytesWrapper => {
	return typeof input === 'object' && input !== null && BYTES_SYMBOL in input;
};

const BASE64_RE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(?:==)?|[A-Za-z0-9+/]{3}=?)?$/;
const isBase64 = (input: unknown): input is string => {
	if (typeof input !== 'string') {
		return false;
	}

	return BASE64_RE.test(input);
};

// #__NO_SIDE_EFFECTS__
export const isBytes = (input: unknown): input is Bytes => {
	const v = input as any;

	return (
		typeof v === 'object' &&
		v !== null &&
		(BYTES_SYMBOL in v || (isBase64(v.$bytes) && Object.keys(v).length === 1))
	);
};
