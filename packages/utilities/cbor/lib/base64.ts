const BASE64_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const BASE64_BITS = 6;

const BASE64_CODES: Record<string, number> = /*#__PURE__*/ (() => {
	const codes: Record<string, number> = {};
	for (let i = 0, ilen = BASE64_CHARSET.length; i < ilen; i++) {
		codes[BASE64_CHARSET[i]] = i;
	}

	return codes;
})();

export const decode = (str: string): Uint8Array => {
	// Calculate padding
	// let end = str.length;
	// while (str[end - 1] === '=') {
	// 	--end;
	// }

	const end = str.length;

	// Allocate
	const out = new Uint8Array(((end * BASE64_BITS) / 8) | 0);

	// Parse
	let bits = 0; // Number of bits currently in the buffer
	let buffer = 0; // Bits waiting to be written out, MSB first
	let written = 0; // Next byte to write

	for (let i = 0; i < end; ++i) {
		// Read one character from the string:
		const value = BASE64_CODES[str[i]];
		if (value === undefined) {
			throw new SyntaxError(`invalid base64 string`);
		}

		// Append the bits to the buffer:
		buffer = (buffer << BASE64_BITS) | value;
		bits += BASE64_BITS;

		// Write out some bits if the buffer has a byte's worth:
		if (bits >= 8) {
			bits -= 8;
			out[written++] = 0xff & (buffer >> bits);
		}
	}

	// Verify
	if (bits >= BASE64_BITS || (0xff & (buffer << (8 - bits))) !== 0) {
		throw new SyntaxError('unexpected end of data');
	}

	return out;
};

export const encode = (data: Uint8Array): string => {
	// const pad = BASE64_CHARSET[BASE64_CHARSET.length - 1] === '=';
	const mask = (1 << BASE64_BITS) - 1;
	let out = '';

	let bits = 0; // Number of bits currently in the buffer
	let buffer = 0; // Bits waiting to be written out, MSB first

	for (let i = 0; i < data.length; ++i) {
		// Slurp data into the buffer:
		buffer = (buffer << 8) | data[i];
		bits += 8;

		// Write out as much as we can:
		while (bits > BASE64_BITS) {
			bits -= BASE64_BITS;
			out += BASE64_CHARSET[mask & (buffer >> bits)];
		}
	}

	// Partial character:
	if (bits !== 0) {
		out += BASE64_CHARSET[mask & (buffer << (BASE64_BITS - bits))];
	}

	// Add padding characters until we hit a byte boundary:
	// if (pad) {
	// 	while (((out.length * BASE64_BITS) & 7) !== 0) {
	// 		out += '=';
	// 	}
	// }

	return out;
};
