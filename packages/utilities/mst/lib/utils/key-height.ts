import { encodeKey } from './keys.ts';
import { sha256 } from './sha256.ts';

/**
 * computes the MST height for a given key by counting leading zeros in its hash
 *
 * @param key the key to compute height for
 * @returns the height (number of leading zero bits in 2-bit chunks)
 */
export const computeKeyHeight = (key: string): number => {
	const hash = sha256(encodeKey(key));

	let lz = 0;
	for (let idx = 0; idx < 8; idx++) {
		const word = hash[idx];
		lz += Math.clz32(word);

		if (word !== 0) {
			break;
		}
	}

	return lz >>> 1;
};
