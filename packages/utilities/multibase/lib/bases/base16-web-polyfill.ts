import { createRfc4648Decode, createRfc4648Encode } from '../utils.js';

const BASE16_CHARSET = '0123456789abcdef';

export const fromBase16 = /*#__PURE__*/ createRfc4648Decode(BASE16_CHARSET, 4, false);
export const toBase16 = /*#__PURE__*/ createRfc4648Encode(BASE16_CHARSET, 4, false);
