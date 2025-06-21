import { getUtf8Length } from '../validations/utils.js';

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

	const MIN_LENGTH = 3;
	const MAX_LENGTH = 8192;

	const utf16Len = input.length;
	const maybeUtf8Len = utf16Len * 3;

	// fail early if estimated upper bound is too small
	if (maybeUtf8Len < MIN_LENGTH) {
		return false;
	}

	// skip calculation if UTF-16 length already satisfies both constraints
	if (utf16Len >= MIN_LENGTH && maybeUtf8Len <= MAX_LENGTH) {
		return URI_RE.test(input);
	}

	const utf8Len = getUtf8Length(input);

	if (utf8Len < MIN_LENGTH || utf8Len > MAX_LENGTH) {
		return false;
	}

	return URI_RE.test(input);
};
