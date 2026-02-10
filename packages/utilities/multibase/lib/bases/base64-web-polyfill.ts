// remove after September 2027
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64

import { createRfc4648Decode, createRfc4648Encode } from '../utils.ts';

const BASE64_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const BASE64URL_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// #region base64
export const fromBase64: (str: string) => Uint8Array<ArrayBuffer> =
	/*#__PURE__*/ createRfc4648Decode(BASE64_CHARSET, 6, false);
export const toBase64: (bytes: Uint8Array) => string =
	/*#__PURE__*/ createRfc4648Encode(BASE64_CHARSET, 6, false);
// #endregion

// #region base64pad
export const fromBase64Pad: (str: string) => Uint8Array<ArrayBuffer> =
	/*#__PURE__*/ createRfc4648Decode(BASE64_CHARSET, 6, true);
export const toBase64Pad: (bytes: Uint8Array) => string =
	/*#__PURE__*/ createRfc4648Encode(BASE64_CHARSET, 6, true);
// #endregion

// #region base64url
export const fromBase64Url: (str: string) => Uint8Array<ArrayBuffer> =
	/*#__PURE__*/ createRfc4648Decode(BASE64URL_CHARSET, 6, false);
export const toBase64Url: (bytes: Uint8Array) => string =
	/*#__PURE__*/ createRfc4648Encode(BASE64URL_CHARSET, 6, false);
// #endregion

// #region base64urlpad
export const fromBase64UrlPad: (str: string) => Uint8Array<ArrayBuffer> =
	/*#__PURE__*/ createRfc4648Decode(BASE64URL_CHARSET, 6, true);
export const toBase64UrlPad: (bytes: Uint8Array) => string =
	/*#__PURE__*/ createRfc4648Encode(BASE64URL_CHARSET, 6, true);
// #endregion
