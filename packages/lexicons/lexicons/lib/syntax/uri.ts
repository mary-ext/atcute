import { isUtf8LengthInRange } from '@atcute/uint8array';

/**
 * represents a generic URI
 */
export type GenericUri = `${string}:${string}`;

const URI_RE = /^\w+:(?:\/\/)?[^\s/][^\s]*$/;

// #__NO_SIDE_EFFECTS__
export const isGenericUri = (input: unknown): input is GenericUri => {
	if (typeof input !== 'string') {
		return false;
	}

	if (!isUtf8LengthInRange(input, 3, 8192)) {
		return false;
	}

	return URI_RE.test(input);
};
