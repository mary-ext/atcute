import { createRfc4648Decode, createRfc4648Encode } from '../utils.js';

const HAS_UINT8_BASE64_SUPPORT = 'fromBase64' in Uint8Array;

const BASE64_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const BASE64URL_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// seems to be faster if we just check for the specific characters that are forbidden yet
// allowed by fromBase64.
const WS_RE = /[\s]/;
const WS_PAD_RE = /[\s=]/;

export const fromBase64 = !HAS_UINT8_BASE64_SUPPORT
	? /*#__PURE__*/ createRfc4648Decode(BASE64_CHARSET, 6, false)
	: (str: string): Uint8Array => {
			if (str.length % 4 === 1 || WS_PAD_RE.test(str)) {
				throw new SyntaxError(`invalid base64 string`);
			}

			return Uint8Array.fromBase64(str, { alphabet: 'base64', lastChunkHandling: 'loose' });
		};

export const toBase64 = !HAS_UINT8_BASE64_SUPPORT
	? /*#__PURE__*/ createRfc4648Encode(BASE64_CHARSET, 6, false)
	: (bytes: Uint8Array): string => {
			return bytes.toBase64({ alphabet: 'base64', omitPadding: true });
		};

export const fromBase64Pad = !HAS_UINT8_BASE64_SUPPORT
	? /*#__PURE__*/ createRfc4648Decode(BASE64_CHARSET, 6, true)
	: (str: string): Uint8Array => {
			if (str.length % 4 !== 0 || WS_RE.test(str)) {
				throw new SyntaxError(`invalid base64 string`);
			}

			return Uint8Array.fromBase64(str, { alphabet: 'base64', lastChunkHandling: 'strict' });
		};

export const toBase64Pad = !HAS_UINT8_BASE64_SUPPORT
	? /*#__PURE__*/ createRfc4648Encode(BASE64_CHARSET, 6, true)
	: (bytes: Uint8Array): string => {
			return bytes.toBase64({ alphabet: 'base64', omitPadding: false });
		};

export const fromBase64Url = !HAS_UINT8_BASE64_SUPPORT
	? /*#__PURE__*/ createRfc4648Decode(BASE64URL_CHARSET, 6, false)
	: (str: string): Uint8Array => {
			if (str.length % 4 === 1 || WS_PAD_RE.test(str)) {
				throw new SyntaxError(`invalid base64 string`);
			}

			return Uint8Array.fromBase64(str, { alphabet: 'base64url', lastChunkHandling: 'loose' });
		};

export const toBase64Url = !HAS_UINT8_BASE64_SUPPORT
	? /*#__PURE__*/ createRfc4648Encode(BASE64URL_CHARSET, 6, false)
	: (bytes: Uint8Array): string => {
			return bytes.toBase64({ alphabet: 'base64url', omitPadding: true });
		};

export const fromBase64UrlPad = !HAS_UINT8_BASE64_SUPPORT
	? /*#__PURE__*/ createRfc4648Decode(BASE64URL_CHARSET, 6, true)
	: (str: string): Uint8Array => {
			if (str.length % 4 !== 0 || WS_RE.test(str)) {
				throw new SyntaxError(`invalid base64 string`);
			}

			return Uint8Array.fromBase64(str, { alphabet: 'base64url', lastChunkHandling: 'strict' });
		};

export const toBase64UrlPad = !HAS_UINT8_BASE64_SUPPORT
	? /*#__PURE__*/ createRfc4648Encode(BASE64URL_CHARSET, 6, true)
	: (bytes: Uint8Array): string => {
			return bytes.toBase64({ alphabet: 'base64url', omitPadding: false });
		};
