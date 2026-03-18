import { countGraphemes } from 'unicode-segmenter/grapheme';

import { isAsciiWithoutCr } from './utils.ts';

/**
 * returns the grapheme length of a string
 * @param text string to count graphemes in
 * @returns grapheme count
 */
export const getGraphemeLength = (text: string): number => {
	if (isAsciiWithoutCr(text)) {
		return text.length;
	}

	return countGraphemes(text);
};

/**
 * checks if the grapheme length of a string is within the specified range
 * @param text string to check
 * @param min minimum grapheme length (inclusive)
 * @param max maximum grapheme length (inclusive)
 * @returns true if the grapheme length is within range
 */
export const isGraphemeLengthInRange = (text: string, min: number, max: number): boolean => {
	const utf16Len = text.length;

	// UTF-16 length < min means grapheme count < min
	if (utf16Len < min) {
		return false;
	}

	// if there's no minimum constraint and UTF-16 length is within max,
	// grapheme count is definitely within max
	if (min === 0 && utf16Len <= max) {
		return true;
	}

	if (isAsciiWithoutCr(text)) {
		return utf16Len <= max;
	}

	const count = countGraphemes(text);
	return count >= min && count <= max;
};
