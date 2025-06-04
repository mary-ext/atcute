import { createRfc4648Decode, createRfc4648Encode } from '../utils.js';

const BASE32_CHARSET = 'abcdefghijklmnopqrstuvwxyz234567';

export const fromBase32: (source: string) => Uint8Array = /*#__PURE__*/ createRfc4648Decode(
	BASE32_CHARSET,
	5,
	false,
);

export const toBase32: (source: Uint8Array) => string = /*#__PURE__*/ createRfc4648Encode(
	BASE32_CHARSET,
	5,
	false,
);
