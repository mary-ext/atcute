import { SHA256 } from 'bun';

/**
 * computes the MST height for a given key by counting leading zeros in its hash
 *
 * @param key the key to compute height for
 * @returns the height (number of leading zero bits in 2-bit chunks)
 */
export const computeKeyHeight = (key: string): number => {
	// Bun hashes strings as UTF-8; allocating the digest benchmarks faster than reusing a buffer
	const hash = SHA256.hash(key) as Uint8Array;

	let lz = 0;
	for (let idx = 0; idx < 32; idx++) {
		const byte = hash[idx];
		lz += Math.clz32(byte) - 24;

		if (byte !== 0) {
			break;
		}
	}

	return lz >>> 1;
};
