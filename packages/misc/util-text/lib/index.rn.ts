import { countGraphemes } from 'unicode-segmenter/grapheme';

/**
 * returns the grapheme length of a string
 * @param text string to count graphemes in
 * @returns grapheme count
 */
export const getGraphemeLength = (text: string): number => {
	return countGraphemes(text);
};
