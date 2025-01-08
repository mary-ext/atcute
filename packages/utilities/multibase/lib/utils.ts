import { alloc, allocUnsafe } from '@atcute/uint8array';

export const createRfc4648Encode = (alphabet: string, bitsPerChar: number, pad: boolean) => {
	return (bytes: Uint8Array): string => {
		const mask = (1 << bitsPerChar) - 1;
		let str = '';

		let bits = 0; // Number of bits currently in the buffer
		let buffer = 0; // Bits waiting to be written out, MSB first
		for (let i = 0; i < bytes.length; ++i) {
			// Slurp data into the buffer:
			buffer = (buffer << 8) | bytes[i];
			bits += 8;

			// Write out as much as we can:
			while (bits > bitsPerChar) {
				bits -= bitsPerChar;
				str += alphabet[mask & (buffer >> bits)];
			}
		}

		// Partial character:
		if (bits !== 0) {
			str += alphabet[mask & (buffer << (bitsPerChar - bits))];
		}

		// Add padding characters until we hit a byte boundary:
		if (pad) {
			while (((str.length * bitsPerChar) & 7) !== 0) {
				str += '=';
			}
		}

		return str;
	};
};

export const createRfc4648Decode = (alphabet: string, bitsPerChar: number, pad: boolean) => {
	// Build the character lookup table:
	const codes: Record<string, number> = {};
	for (let i = 0; i < alphabet.length; ++i) {
		codes[alphabet[i]] = i;
	}

	return (str: string) => {
		// Count the padding bytes:
		let end = str.length;
		while (pad && str[end - 1] === '=') {
			--end;
		}

		// Allocate the output:
		const bytes = allocUnsafe(((end * bitsPerChar) / 8) | 0);

		// Parse the data:
		let bits = 0; // Number of bits currently in the buffer
		let buffer = 0; // Bits waiting to be written out, MSB first
		let written = 0; // Next byte to write
		for (let i = 0; i < end; ++i) {
			// Read one character from the string:
			const value = codes[str[i]];
			if (value === undefined) {
				throw new SyntaxError(`invalid base string`);
			}

			// Append the bits to the buffer:
			buffer = (buffer << bitsPerChar) | value;
			bits += bitsPerChar;

			// Write out some bits if the buffer has a byte's worth:
			if (bits >= 8) {
				bits -= 8;
				bytes[written++] = 0xff & (buffer >> bits);
			}
		}

		// Verify that we have received just enough bits:
		if (bits >= bitsPerChar || (0xff & (buffer << (8 - bits))) !== 0) {
			throw new SyntaxError('unexpected end of data');
		}

		return bytes;
	};
};

export const createBtcBaseEncode = (alphabet: string) => {
	if (alphabet.length >= 255) {
		throw new RangeError(`alphabet too long`);
	}

	const BASE = alphabet.length;
	const LEADER = alphabet.charAt(0);
	const iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up

	return (source: Uint8Array): string => {
		if (source.length === 0) {
			return '';
		}

		// Skip & count leading zeroes.
		let zeroes = 0;
		let length = 0;
		let pbegin = 0;
		const pend = source.length;
		while (pbegin !== pend && source[pbegin] === 0) {
			pbegin++;
			zeroes++;
		}

		// Allocate enough space in big-endian base58 representation.
		const size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
		const b58 = alloc(size);

		// Process the bytes.
		while (pbegin !== pend) {
			let carry = source[pbegin];

			// Apply "b58 = b58 * 256 + ch".
			let i = 0;
			for (let it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
				carry += (256 * b58[it1]) >>> 0;
				b58[it1] = carry % BASE >>> 0;
				carry = (carry / BASE) >>> 0;
			}

			if (carry !== 0) {
				throw new Error('non-zero carry');
			}

			length = i;
			pbegin++;
		}

		// Skip leading zeroes in base58 result.
		let it2 = size - length;
		while (it2 !== size && b58[it2] === 0) {
			it2++;
		}

		// Translate the result into a string.
		let str = LEADER.repeat(zeroes);
		for (; it2 < size; ++it2) {
			str += alphabet.charAt(b58[it2]);
		}

		return str;
	};
};

export const createBtcBaseDecode = (alphabet: string) => {
	if (alphabet.length >= 255) {
		throw new RangeError(`alphabet too long`);
	}

	const BASE_MAP = allocUnsafe(256).fill(255);
	for (let i = 0; i < alphabet.length; i++) {
		const xc = alphabet.charCodeAt(i);

		if (BASE_MAP[xc] !== 255) {
			throw new RangeError(`${alphabet[i]} is ambiguous`);
		}

		BASE_MAP[xc] = i;
	}

	const BASE = alphabet.length;
	const LEADER = alphabet.charAt(0);
	const FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up

	return (source: string): Uint8Array => {
		if (source.length === 0) {
			return allocUnsafe(0);
		}

		// Skip and count leading '1's.
		let psz = 0;
		let zeroes = 0;
		let length = 0;

		while (source[psz] === LEADER) {
			zeroes++;
			psz++;
		}

		// Allocate enough space in big-endian base256 representation.
		const size = ((source.length - psz) * FACTOR + 1) >>> 0; // log(58) / log(256), rounded up.
		const b256 = alloc(size);

		// Process the characters.
		while (psz < source.length) {
			// Decode character
			let carry = BASE_MAP[source.charCodeAt(psz)];

			// Invalid character
			if (carry === 255) {
				throw new Error(`invalid string`);
			}

			let i = 0;
			for (let it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
				carry += (BASE * b256[it3]) >>> 0;
				b256[it3] = carry % 256 >>> 0;
				carry = (carry / 256) >>> 0;
			}
			if (carry !== 0) {
				throw new Error('non-zero carry');
			}
			length = i;
			psz++;
		}

		// Skip leading zeroes in b256.
		let it4 = size - length;
		while (it4 !== size && b256[it4] === 0) {
			it4++;
		}

		if (it4 === zeroes) {
			return b256;
		}

		const vch = allocUnsafe(zeroes + (size - it4));
		vch.fill(0, 0, zeroes);
		vch.set(b256.subarray(it4), zeroes);

		return vch;
	};
};
