const CHAR_VALUES: Uint8Array = /*#__PURE__*/ (() => {
	const t = new Uint8Array(128).fill(0xff);
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < alphabet.length; i++) {
		t[alphabet.charCodeAt(i)] = i;
	}
	t[0x2b] = t[0x2d] = 62; // `+` and `-`
	t[0x2f] = t[0x5f] = 63; // `/` and `_`
	return t;
})();

const REM_LEN = [0, 2, 3];

// native decoding validates the alphabet but silently accepts whitespace and non-canonical final
// chunks; these re-tighten to a single canonical encoding without re-scanning the string.
const assertCanonicalUnpadded = (str: string, n: number): void => {
	const rem = n % 3;
	if (str.length !== ((n / 3) | 0) * 4 + REM_LEN[rem]) {
		throw new SyntaxError(`invalid base64 string`);
	}
	if (rem !== 0 && (CHAR_VALUES[str.charCodeAt(str.length - 1)] & (rem === 1 ? 0x0f : 0x03)) !== 0) {
		throw new SyntaxError(`invalid base64 string`);
	}
};

const assertCanonicalPadded = (str: string, n: number): void => {
	if (str.length !== (((n + 2) / 3) | 0) * 4) {
		throw new SyntaxError(`invalid base64 string`);
	}
};

// #region base64
export const fromBase64 = (str: string): Uint8Array<ArrayBuffer> => {
	const bytes = Uint8Array.fromBase64(str, {
		alphabet: 'base64',
		lastChunkHandling: 'loose',
	}) as Uint8Array<ArrayBuffer>;
	assertCanonicalUnpadded(str, bytes.length);
	return bytes;
};

export const toBase64 = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64', omitPadding: true });
};
// #endregion

// #region base64pad
export const fromBase64Pad = (str: string): Uint8Array<ArrayBuffer> => {
	const bytes = Uint8Array.fromBase64(str, {
		alphabet: 'base64',
		lastChunkHandling: 'strict',
	}) as Uint8Array<ArrayBuffer>;
	assertCanonicalPadded(str, bytes.length);
	return bytes;
};

export const toBase64Pad = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64', omitPadding: false });
};
// #endregion

// #region base64url
export const fromBase64Url = (str: string): Uint8Array<ArrayBuffer> => {
	const bytes = Uint8Array.fromBase64(str, {
		alphabet: 'base64url',
		lastChunkHandling: 'loose',
	}) as Uint8Array<ArrayBuffer>;
	assertCanonicalUnpadded(str, bytes.length);
	return bytes;
};

export const toBase64Url = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64url', omitPadding: true });
};
// #endregion

// #region base64urlpad
export const fromBase64UrlPad = (str: string): Uint8Array<ArrayBuffer> => {
	const bytes = Uint8Array.fromBase64(str, {
		alphabet: 'base64url',
		lastChunkHandling: 'strict',
	}) as Uint8Array<ArrayBuffer>;
	assertCanonicalPadded(str, bytes.length);
	return bytes;
};

export const toBase64UrlPad = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64url', omitPadding: false });
};
// #endregion
