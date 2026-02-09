import {
	fromBase64 as fromBase64Native,
	fromBase64Pad as fromBase64PadNative,
	fromBase64Url as fromBase64UrlNative,
	fromBase64UrlPad as fromBase64UrlPadNative,
	toBase64 as toBase64Native,
	toBase64Pad as toBase64PadNative,
	toBase64Url as toBase64UrlNative,
	toBase64UrlPad as toBase64UrlPadNative,
} from './base64-web-native.ts';
import {
	fromBase64Pad as fromBase64PadPolyfill,
	fromBase64 as fromBase64Polyfill,
	fromBase64UrlPad as fromBase64UrlPadPolyfill,
	fromBase64Url as fromBase64UrlPolyfill,
	toBase64Pad as toBase64PadPolyfill,
	toBase64 as toBase64Polyfill,
	toBase64UrlPad as toBase64UrlPadPolyfill,
	toBase64Url as toBase64UrlPolyfill,
} from './base64-web-polyfill.ts';

const HAS_NATIVE_SUPPORT = 'fromBase64' in Uint8Array;

// #region base64
export const fromBase64 = !HAS_NATIVE_SUPPORT ? fromBase64Polyfill : fromBase64Native;
export const toBase64 = !HAS_NATIVE_SUPPORT ? toBase64Polyfill : toBase64Native;
// #endregion

// #region base64pad
export const fromBase64Pad = !HAS_NATIVE_SUPPORT ? fromBase64PadPolyfill : fromBase64PadNative;
export const toBase64Pad = !HAS_NATIVE_SUPPORT ? toBase64PadPolyfill : toBase64PadNative;
// #endregion

// #region base64url
export const fromBase64Url = !HAS_NATIVE_SUPPORT ? fromBase64UrlPolyfill : fromBase64UrlNative;
export const toBase64Url = !HAS_NATIVE_SUPPORT ? toBase64UrlPolyfill : toBase64UrlNative;
// #endregion

// #region base64urlpad
export const fromBase64UrlPad = !HAS_NATIVE_SUPPORT ? fromBase64UrlPadPolyfill : fromBase64UrlPadNative;
export const toBase64UrlPad = !HAS_NATIVE_SUPPORT ? toBase64UrlPadPolyfill : toBase64UrlPadNative;
// #endregion
