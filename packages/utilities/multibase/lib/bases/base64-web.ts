import { createRfc4648Decode, createRfc4648Encode } from '../utils.js';

const HAS_UINT8_BASE64_SUPPORT = 'fromBase64' in Uint8Array;

const BASE64_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const BASE64URL_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// seems to be faster if we just check for the specific characters that are forbidden yet
// allowed by fromBase64.
const WS_RE = /[\s]/;
const WS_PAD_RE = /[\s=]/;

// #region base64
/** @internal */
export const _fromBase64Polyfill = /*#__PURE__*/ createRfc4648Decode(BASE64_CHARSET, 6, false);
/** @internal */
export const _toBase64Polyfill = /*#__PURE__*/ createRfc4648Encode(BASE64_CHARSET, 6, false);

/** @internal */
export const _fromBase64Native = (str: string): Uint8Array => {
	if (str.length % 4 === 1 || WS_PAD_RE.test(str)) {
		throw new SyntaxError(`invalid base64 string`);
	}

	return Uint8Array.fromBase64(str, { alphabet: 'base64', lastChunkHandling: 'loose' });
};

/** @internal */
export const _toBase64Native = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64', omitPadding: true });
};

export const fromBase64 = !HAS_UINT8_BASE64_SUPPORT ? _fromBase64Polyfill : _fromBase64Native;

export const toBase64 = !HAS_UINT8_BASE64_SUPPORT ? _toBase64Polyfill : _toBase64Native;
// #endregion

// #region base64pad
/** @internal */
export const _fromBase64PadPolyfill = /*#__PURE__*/ createRfc4648Decode(BASE64_CHARSET, 6, true);
/** @internal */
export const _toBase64PadPolyfill = /*#__PURE__*/ createRfc4648Encode(BASE64_CHARSET, 6, true);

/** @internal */
export const _fromBase64PadNative = (str: string): Uint8Array => {
	if (str.length % 4 !== 0 || WS_RE.test(str)) {
		throw new SyntaxError(`invalid base64 string`);
	}

	return Uint8Array.fromBase64(str, { alphabet: 'base64', lastChunkHandling: 'strict' });
};

/** @internal */
export const _toBase64PadNative = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64', omitPadding: false });
};

export const fromBase64Pad = !HAS_UINT8_BASE64_SUPPORT ? _fromBase64PadPolyfill : _fromBase64PadNative;

export const toBase64Pad = !HAS_UINT8_BASE64_SUPPORT ? _toBase64PadPolyfill : _toBase64PadNative;
// #endregion

// #region base64url
/** @internal */
export const _fromBase64UrlPolyfill = /*#__PURE__*/ createRfc4648Decode(BASE64URL_CHARSET, 6, false);
/** @internal */
export const _toBase64UrlPolyfill = /*#__PURE__*/ createRfc4648Encode(BASE64URL_CHARSET, 6, false);

/** @internal */
export const _fromBase64UrlNative = (str: string): Uint8Array => {
	if (str.length % 4 === 1 || WS_PAD_RE.test(str)) {
		throw new SyntaxError(`invalid base64 string`);
	}

	return Uint8Array.fromBase64(str, { alphabet: 'base64url', lastChunkHandling: 'loose' });
};

/** @internal */
export const _toBase64UrlNative = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64url', omitPadding: true });
};

export const fromBase64Url = !HAS_UINT8_BASE64_SUPPORT ? _fromBase64UrlPolyfill : _fromBase64UrlNative;

export const toBase64Url = !HAS_UINT8_BASE64_SUPPORT ? _toBase64UrlPolyfill : _toBase64UrlNative;
// #endregion

// #region base64urlpad
/** @internal */
export const _fromBase64UrlPadPolyfill = /*#__PURE__*/ createRfc4648Decode(BASE64URL_CHARSET, 6, true);
/** @internal */
export const _toBase64UrlPadPolyfill = /*#__PURE__*/ createRfc4648Encode(BASE64URL_CHARSET, 6, true);

/** @internal */
export const _fromBase64UrlPadNative = (str: string): Uint8Array => {
	if (str.length % 4 !== 0 || WS_RE.test(str)) {
		throw new SyntaxError(`invalid base64 string`);
	}

	return Uint8Array.fromBase64(str, { alphabet: 'base64url', lastChunkHandling: 'strict' });
};

/** @internal */
export const _toBase64UrlPadNative = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64url', omitPadding: false });
};

export const fromBase64UrlPad = !HAS_UINT8_BASE64_SUPPORT
	? _fromBase64UrlPadPolyfill
	: _fromBase64UrlPadNative;

export const toBase64UrlPad = !HAS_UINT8_BASE64_SUPPORT ? _toBase64UrlPadPolyfill : _toBase64UrlPadNative;
// #endregion
