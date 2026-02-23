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

	return (str: string): Uint8Array<ArrayBuffer> => {
		// Count the padding bytes:
		let end = str.length;
		// oxlint-disable-next-line no-unmodified-loop-condition
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

		// Allocate enough space in big-endian base-N representation.
		const dataLen = pend - pbegin;
		const size = (dataLen * iFACTOR + 1) >>> 0;
		const bN = alloc(size);

		// Process 3 source bytes at a time where possible.
		// multiplier: 256^3 = 16777216. max carry: 16777216 * (BASE-1) + (BASE-1).
		// for BASE=58: 16777216 * 57 = 956301312, well within 2^32 - 1.
		{
			const rem = dataLen % 3;
			const tripleEnd = pend - rem;

			while (pbegin < tripleEnd) {
				let carry = (source[pbegin] << 16) | (source[pbegin + 1] << 8) | source[pbegin + 2];

				let i = 0;
				for (let it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
					carry = carry + 16777216 * bN[it1];
					bN[it1] = (carry % BASE) | 0;
					carry = (carry / BASE) | 0;
				}

				length = i;
				pbegin += 3;
			}
		}

		// Process remaining 0-2 bytes one at a time.
		while (pbegin !== pend) {
			let carry = source[pbegin];

			let i = 0;
			for (let it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
				carry = carry + 256 * bN[it1];
				bN[it1] = (carry % BASE) | 0;
				carry = (carry / BASE) | 0;
			}

			length = i;
			pbegin++;
		}

		// Skip leading zeroes in base-N result.
		let it2 = size - length;
		while (it2 !== size && bN[it2] === 0) {
			it2++;
		}

		// Translate the result into a string.
		let str = LEADER.repeat(zeroes);
		for (; it2 < size; ++it2) {
			str += alphabet.charAt(bN[it2]);
		}

		return str;
	};
};

export const createBtcBaseDecode = (alphabet: string) => {
	if (alphabet.length >= 255) {
		throw new RangeError(`alphabet too long`);
	}

	const BASE_MAP = new Uint8Array(128).fill(255);
	for (let i = 0; i < alphabet.length; i++) {
		const xc = alphabet.charCodeAt(i);

		if (xc >= 128) {
			throw new RangeError(`non-ASCII character in alphabet`);
		}
		if (BASE_MAP[xc] !== 255) {
			throw new RangeError(`${alphabet[i]} is ambiguous`);
		}

		BASE_MAP[xc] = i;
	}

	const BASE = alphabet.length;
	const BASE2 = BASE * BASE;
	const LEADER = alphabet.charAt(0);
	const FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up

	return (source: string): Uint8Array<ArrayBuffer> => {
		if (source.length === 0) {
			return allocUnsafe(0);
		}

		// Skip and count leading leader characters.
		let psz = 0;
		let zeroes = 0;
		let length = 0;

		while (source[psz] === LEADER) {
			zeroes++;
			psz++;
		}

		// Allocate enough space in big-endian base256 representation.
		const remaining = source.length - psz;
		const size = (remaining * FACTOR + 1) >>> 0;
		const b256 = alloc(size);

		// Process 2 source characters at a time where possible.
		// combined value: c0 * BASE + c1, multiplier: BASE^2.
		// max carry: BASE^2 * 255 + (BASE^2 - 1).
		// for BASE=58: 3364 * 255 + 3363 = 861183, well within safe integer range.
		{
			const rem = remaining & 1;
			const pairEnd = source.length - rem;

			while (psz < pairEnd) {
				const c0 = BASE_MAP[source.charCodeAt(psz)];
				const c1 = BASE_MAP[source.charCodeAt(psz + 1)];

				if (c0 === 255 || c1 === 255) {
					throw new Error(`invalid string`);
				}

				let carry = c0 * BASE + c1;

				let i = 0;
				for (let it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
					carry += BASE2 * b256[it3];
					b256[it3] = carry & 0xff;
					carry = (carry - (carry & 0xff)) / 256;
				}
				if (carry !== 0) {
					throw new Error('non-zero carry');
				}
				length = i;
				psz += 2;
			}
		}

		// Process remaining character if odd count.
		if (psz < source.length) {
			let carry = BASE_MAP[source.charCodeAt(psz)];

			if (carry === 255) {
				throw new Error(`invalid string`);
			}

			let i = 0;
			for (let it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
				carry += BASE * b256[it3];
				b256[it3] = carry & 0xff;
				carry = carry >>> 8;
			}
			if (carry !== 0) {
				throw new Error('non-zero carry');
			}
			length = i;
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
