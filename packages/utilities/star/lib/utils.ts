import * as CBOR from '@atcute/cbor';
import { equals } from '@atcute/uint8array';

import { STAR_MAGIC } from './constants.ts';
import { type StarMeta, isStarMeta } from './types.ts';

/**
 * resolves a length limit against its default, clamping to safe integer bounds
 *
 * @internal
 */
export const resolveLimit = (value: number | undefined, fallback: number): number => {
	// NaN or negative falls back to the default
	if (value === undefined || !(value >= 0)) {
		return fallback;
	}

	return value < Number.MAX_SAFE_INTEGER ? value : Number.MAX_SAFE_INTEGER;
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
