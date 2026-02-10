// remove after September 2027
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex

import { createRfc4648Decode, createRfc4648Encode } from '../utils.ts';

const BASE16_CHARSET = '0123456789abcdef';

export const fromBase16: (str: string) => Uint8Array<ArrayBuffer> =
	/*#__PURE__*/ createRfc4648Decode(BASE16_CHARSET, 4, false);
export const toBase16: (bytes: Uint8Array) => string =
	/*#__PURE__*/ createRfc4648Encode(BASE16_CHARSET, 4, false);
