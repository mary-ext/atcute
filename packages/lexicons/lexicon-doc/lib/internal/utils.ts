import { getUtf8Length } from '@atcute/uint8array';
import { getGraphemeLength } from '@atcute/util-text';

export const isWithinUtf8Bounds = (input: string, min = 0, max = Infinity): 'max' | 'min' | undefined => {
	const utf16Len = input.length;
	const maybeUtf8Len = utf16Len * 3;

	// fail early if estimated upper bound is too small
	if (maybeUtf8Len < min) {
		return 'min';
	}

	// skip if UTF-16 length already satisfies both constraints
	if (utf16Len >= min && maybeUtf8Len <= max) {
		return undefined;
	}

	const utf8Len = getUtf8Length(input);

	if (utf8Len < min) {
		return 'min';
	}

	if (utf8Len > max) {
		return 'max';
	}

	return undefined;
};

export const isWithinGraphemeBounds = (input: string, min = 0, max = Infinity): 'max' | 'min' | undefined => {
	// grapheme conversion is expensive, so we're going to do some safe naive
	// checks where we assume 1 UTF-16 character = 1 grapheme.

	const utf16Len = input.length;

	// fail early if UTF-16 length is too small
	if (utf16Len < min) {
		return 'min';
	}

	// if there is no minimum bounds, we can safely skip when UTF-16 is
	// within the maximum bounds.
	if (min === 0 && utf16Len <= max) {
		return undefined;
	}

	const graphemeLen = getGraphemeLength(input);

	if (graphemeLen < min) {
		return 'min';
	}

	if (graphemeLen > max) {
		return 'max';
	}

	return undefined;
};
