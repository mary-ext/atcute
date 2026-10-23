import * as CBOR from '@atcute/cbor';
import { equals } from '@atcute/uint8array';

import { STAR_MAGIC } from './constants.ts';
import { type StarMeta, isStarMeta } from './types.ts';

/**
 * caps a length limit at the format maximum
 *
 * @internal
 */
export const resolveLimit = (value: number | undefined, max: number): number => {
	// NaN falls back to the format limit
	return value !== undefined && value < max ? value : max;
};

/** @internal */
export const assertStarMagic = (bytes: Uint8Array): void => {
	if (!equals(bytes, STAR_MAGIC)) {
		throw new TypeError(`expected a star v1 archive`);
	}
};

/** @internal */
export const decodeStarMeta = (bytes: Uint8Array): StarMeta => {
	const data = CBOR.decode(bytes);
	if (!isStarMeta(data)) {
		throw new TypeError(`star metadata must be a map with a $type string`);
	}

	return data;
};
