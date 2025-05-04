import type { BaseConstraint, IssueLeaf } from '../base.js';

export interface StringLengthConstraint<TInput extends string> extends BaseConstraint<TInput> {
	readonly type: 'string_length';
	readonly minLength: number;
	readonly maxLength: number;
}

const getUtf8Length = (str: string): number => {
	const len = str.length;

	let u16pos = 0;
	let u8pos = 0;

	while (u16pos < len) {
		const code = str.charCodeAt(u16pos);

		if (code < 0x80) {
			u16pos += 1;
			u8pos += 1;
		} else if (code < 0x800) {
			u16pos += 1;
			u8pos += 2;
		} else if (code < 0xd800 || code > 0xdbff) {
			u16pos += 1;
			u8pos += 3;
		} else {
			u16pos += 2;
			u8pos += 4;
		}
	}

	return u8pos;
};

// #__NO_SIDE_EFFECTS__
export const stringLength = <TInput extends string>(
	minLength: number,
	maxLength: number = Infinity,
): StringLengthConstraint<TInput> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_string_length',
		minLength: minLength,
		maxLength: maxLength,
	};

	return {
		kind: 'constraint',
		type: 'string_length',
		minLength: minLength,
		maxLength: maxLength,
		'~run'(input, _flags) {
			// UTF-8 conversion can be expensive, so we're going to do some safe naive
			// checks where we assume an upper-bound of the UTF-16 to UTF-8 conversion

			const maybeUtf8Len = input.length * 3;

			// fail early if we're still less than minimum length
			if (maybeUtf8Len < minLength) {
				return issue;
			}

			// skip if we're still within maximum length
			if (maybeUtf8Len <= maxLength) {
				return undefined;
			}

			const utf8Len = getUtf8Length(input);

			if (utf8Len < minLength) {
				return issue;
			}

			if (utf8Len > maxLength) {
				return issue;
			}

			return undefined;
		},
	};
};
