import { toSha256Sync } from '@atcute/uint8array';

import { encodeKey } from './keys.ts';

/**
 * computes the MST height for a given key by counting leading zeros in its hash
 *
 * @param key the key to compute height for
 * @returns the height (number of leading zero bits in 2-bit chunks)
 */
export const computeKeyHeight = (key: string): number => {
	const hash = toSha256Sync(encodeKey(key));

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
