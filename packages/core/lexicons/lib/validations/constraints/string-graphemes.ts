import type { BaseConstraint, IssueLeaf } from '../base.js';

export interface StringGraphemesConstraint<TInput extends string> extends BaseConstraint<TInput> {
	readonly type: 'string_graphemes';
	readonly minGraphemes: number;
	readonly maxGraphemes: number | undefined;
}

const segmenter = new Intl.Segmenter();

const getGraphemeLength = (text: string): number => {
	var iterator = segmenter.segment(text)[Symbol.iterator]();
	var count = 0;

	while (!iterator.next().done) {
		count++;
	}

	return count;
};

// #__NO_SIDE_EFFECTS__
export const stringGraphemes = <TInput extends string>(
	minGraphemes: number,
	maxGraphemes: number = Infinity,
): StringGraphemesConstraint<TInput> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_string_graphemes',
		minGraphemes: minGraphemes,
		maxGraphemes: maxGraphemes,
	};

	return {
		kind: 'constraint',
		type: 'string_graphemes',
		minGraphemes: minGraphemes,
		maxGraphemes: maxGraphemes,
		'~run'(input, _flags) {
			// grapheme conversion is expensive, so we're going to do some safe naive
			// checks where we assume 1 UTF-16 character = 1 grapheme.

			const utf16Len = input.length;

			// fail early if UTF-16 length is less than grapheme length
			if (utf16Len < minGraphemes) {
				return issue;
			}

			// skip if we're still within maximum constraint
			if (utf16Len <= maxGraphemes) {
				return undefined;
			}

			const graphemeLen = getGraphemeLength(input);

			if (graphemeLen < minGraphemes) {
				return issue;
			}

			if (graphemeLen > maxGraphemes) {
				return issue;
			}

			return undefined;
		},
	};
};
