import { createRfc4648Decode, createRfc4648Encode } from '../utils.js';

const HAS_UINT8_BASE16_SUPPORT = 'fromHex' in Uint8Array;

const BASE16_CHARSET = '0123456789abcdef';

/** @internal */
export const _fromBase16Polyfill = /*#__PURE__*/ createRfc4648Decode(BASE16_CHARSET, 4, false);
/** @internal */
export const _toBase16Polyfill = /*#__PURE__*/ createRfc4648Encode(BASE16_CHARSET, 4, false);

/** @internal */
export const _fromBase16Native = (str: string): Uint8Array => {
	return Uint8Array.fromHex(str);
};

/** @internal */
export const _toBase16Native = (bytes: Uint8Array): string => {
	return bytes.toHex();
};

export const fromBase16 = !HAS_UINT8_BASE16_SUPPORT ? _fromBase16Polyfill : _fromBase16Native;
export const toBase16 = !HAS_UINT8_BASE16_SUPPORT ? _toBase16Polyfill : _toBase16Native;
