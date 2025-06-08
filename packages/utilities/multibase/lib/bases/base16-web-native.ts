export const fromBase16 = (str: string): Uint8Array => {
	return Uint8Array.fromHex(str);
};

export const toBase16 = (bytes: Uint8Array): string => {
	return bytes.toHex();
};
