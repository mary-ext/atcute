export const fromBase16 = (str: string): Uint8Array<ArrayBuffer> => {
	return Uint8Array.fromHex(str) as Uint8Array<ArrayBuffer>;
};

export const toBase16 = (bytes: Uint8Array): string => {
	return bytes.toHex();
};
