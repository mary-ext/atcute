const segmenter = new Intl.Segmenter();

/**
 * returns the grapheme length of a string
 * @param text string to count graphemes in
 * @returns grapheme count
 */
export const getGraphemeLength = (text: string): number => {
	const iterator = segmenter.segment(text)[Symbol.iterator]();
	let count = 0;

	while (!iterator.next().done) {
		count++;
	}

	return count;
};
