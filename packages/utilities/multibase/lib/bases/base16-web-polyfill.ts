import { createRfc4648Decode, createRfc4648Encode } from '../utils.js';

const BASE16_CHARSET = '0123456789abcdef';

export const fromBase16: (str: string) => Uint8Array = /*#__PURE__*/ createRfc4648Decode(
	BASE16_CHARSET,
	4,
	false,
);
export const toBase16: (bytes: Uint8Array) => string = /*#__PURE__*/ createRfc4648Encode(
	BASE16_CHARSET,
	4,
	false,
);
