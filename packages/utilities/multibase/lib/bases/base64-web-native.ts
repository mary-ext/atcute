// #region base64
export const fromBase64 = (str: string): Uint8Array => {
	return Uint8Array.fromBase64(str, { alphabet: 'base64', lastChunkHandling: 'loose' });
};

export const toBase64 = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64', omitPadding: true });
};
// #endregion

// #region base64pad
export const fromBase64Pad = (str: string): Uint8Array => {
	return Uint8Array.fromBase64(str, { alphabet: 'base64', lastChunkHandling: 'strict' });
};

export const toBase64Pad = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64', omitPadding: false });
};
// #endregion

// #region base64url
export const fromBase64Url = (str: string): Uint8Array => {
	return Uint8Array.fromBase64(str, { alphabet: 'base64url', lastChunkHandling: 'loose' });
};

export const toBase64Url = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64url', omitPadding: true });
};
// #endregion

// #region base64urlpad
export const fromBase64UrlPad = (str: string): Uint8Array => {
	return Uint8Array.fromBase64(str, { alphabet: 'base64url', lastChunkHandling: 'strict' });
};

export const toBase64UrlPad = (bytes: Uint8Array): string => {
	return bytes.toBase64({ alphabet: 'base64url', omitPadding: false });
};
// #endregion
