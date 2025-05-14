/**
 * @module
 * JWT decoding utilities for session resumption checks.
 * This module is exported for convenience and is no way part of public API,
 * it can be removed at any time.
 */

/**
 * Decodes a JWT token
 * @param token The token string
 * @returns JSON object from the token
 */
export const decodeJwt = (token: string): unknown => {
	const pos = 1;
	const part = token.split('.')[1];

	let decoded: string;

	if (typeof part !== 'string') {
		throw new Error('invalid token: missing part ' + (pos + 1));
	}

	try {
		decoded = base64UrlDecode(part);
	} catch (e) {
		throw new Error('invalid token: invalid b64 for part ' + (pos + 1) + ' (' + (e as Error).message + ')');
	}

	try {
		return JSON.parse(decoded);
	} catch (e) {
		throw new Error('invalid token: invalid json for part ' + (pos + 1) + ' (' + (e as Error).message + ')');
	}
};

/**
 * Decodes a URL-safe Base64 string
 * @param str URL-safe Base64 that needed to be decoded
 * @returns The actual string
 */
export const base64UrlDecode = (str: string): string => {
	let output = str.replace(/-/g, '+').replace(/_/g, '/');

	switch (output.length % 4) {
		case 0:
			break;
		case 2:
			output += '==';
			break;
		case 3:
			output += '=';
			break;
		default:
			throw new Error('base64 string is not of the correct length');
	}

	try {
		return b64DecodeUnicode(output);
	} catch {
		return atob(output);
	}
};

const b64DecodeUnicode = (str: string): string => {
	return decodeURIComponent(
		atob(str).replace(/(.)/g, (_m, p) => {
			let code = p.charCodeAt(0).toString(16).toUpperCase();

			if (code.length < 2) {
				code = '0' + code;
			}

			return '%' + code;
		}),
	);
};
