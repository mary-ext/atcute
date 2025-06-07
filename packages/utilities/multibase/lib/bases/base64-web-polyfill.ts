import { createRfc4648Decode, createRfc4648Encode } from '../utils.js';

const BASE64_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const BASE64URL_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// #region base64
export const fromBase64 = /*#__PURE__*/ createRfc4648Decode(BASE64_CHARSET, 6, false);
export const toBase64 = /*#__PURE__*/ createRfc4648Encode(BASE64_CHARSET, 6, false);
// #endregion

// #region base64pad
export const fromBase64Pad = /*#__PURE__*/ createRfc4648Decode(BASE64_CHARSET, 6, true);
export const toBase64Pad = /*#__PURE__*/ createRfc4648Encode(BASE64_CHARSET, 6, true);
// #endregion

// #region base64url
export const fromBase64Url = /*#__PURE__*/ createRfc4648Decode(BASE64URL_CHARSET, 6, false);
export const toBase64Url = /*#__PURE__*/ createRfc4648Encode(BASE64URL_CHARSET, 6, false);
// #endregion

// #region base64urlpad
export const fromBase64UrlPad = /*#__PURE__*/ createRfc4648Decode(BASE64URL_CHARSET, 6, true);
export const toBase64UrlPad = /*#__PURE__*/ createRfc4648Encode(BASE64URL_CHARSET, 6, true);
// #endregion
