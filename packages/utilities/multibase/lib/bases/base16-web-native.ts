// native `fromHex` accepts uppercase hex, but multibase base16 (`f`) is lowercase-only.
const UPPER_RE = /[A-F]/;

export const fromBase16 = (str: string): Uint8Array<ArrayBuffer> => {
	if (UPPER_RE.test(str)) {
		throw new SyntaxError(`unexpected uppercase characters in base16 string`);
	}

	// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- always backed by a fresh ArrayBuffer
	return Uint8Array.fromHex(str) as Uint8Array<ArrayBuffer>;
};

export const toBase16 = (bytes: Uint8Array): string => {
	return bytes.toHex();
};
