const BASE32_CHARSET = 'abcdefghijklmnopqrstuvwxyz234567';
const BASE32_BITS = 5;

const BASE32_CODES: Record<string, number> = /*#__PURE__*/ (() => {
	const codes: Record<string, number> = {};
	for (let i = 0, ilen = BASE32_CHARSET.length; i < ilen; i++) {
		codes[BASE32_CHARSET[i]] = i;
	}

	return codes;
})();

/**
 * Decode Base32 string into Uint8Array
 */
export const decode = (str: string): Uint8Array => {
	// Calculate padding
	// let end = str.length;
	// while (str[end - 1] === '=') {
	// 	--end;
	// }

	const end = str.length;

	// Allocate
	const out = new Uint8Array(((end * BASE32_BITS) / 8) | 0);

	// Parse
	let bits = 0; // Number of bits currently in the buffer
	let buffer = 0; // Bits waiting to be written out, MSB first
	let written = 0; // Next byte to write

	for (let i = 0; i < end; ++i) {
		// Read one character from the string:
		const value = BASE32_CODES[str[i]];
		if (value === undefined) {
			throw new SyntaxError(`invalid base32 string`);
		}

		// Append the bits to the buffer:
		buffer = (buffer << BASE32_BITS) | value;
		bits += BASE32_BITS;

		// Write out some bits if the buffer has a byte's worth:
		if (bits >= 8) {
			bits -= 8;
			out[written++] = 0xff & (buffer >> bits);
		}
	}

	// Verify
	if (bits >= BASE32_BITS || (0xff & (buffer << (8 - bits))) !== 0) {
		throw new SyntaxError('unexpected end of data');
	}

	return out;
};

/**
 * Encode Uint8Array into Base32 string
 */
export const encode = (data: Uint8Array): string => {
	// const pad = BASE32_CHARSET[BASE32_CHARSET.length - 1] === '=';
	const mask = (1 << BASE32_BITS) - 1;
	let out = '';

	let bits = 0; // Number of bits currently in the buffer
	let buffer = 0; // Bits waiting to be written out, MSB first

	for (let i = 0; i < data.length; ++i) {
		// Slurp data into the buffer:
		buffer = (buffer << 8) | data[i];
		bits += 8;

		// Write out as much as we can:
		while (bits > BASE32_BITS) {
			bits -= BASE32_BITS;
			out += BASE32_CHARSET[mask & (buffer >> bits)];
		}
	}

	// Partial character:
	if (bits !== 0) {
		out += BASE32_CHARSET[mask & (buffer << (BASE32_BITS - bits))];
	}

	// Add padding characters until we hit a byte boundary:
	// if (pad) {
	// 	while (((out.length * BASE32_BITS) & 7) !== 0) {
	// 		out += '=';
	// 	}
	// }

	return out;
};
