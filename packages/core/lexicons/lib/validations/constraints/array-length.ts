import type { BaseConstraint, IssueLeaf } from '../base.js';

export interface ArrayLengthConstraint<TInput extends any[]> extends BaseConstraint<TInput> {
	readonly type: 'array_length';
	readonly minLength: number;
	readonly maxLength: number;
}

// #__NO_SIDE_EFFECTS__
export const arrayLength = <TInput extends any[]>(
	minLength: number,
	maxLength: number = Infinity,
): ArrayLengthConstraint<TInput> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_array_length',
		minLength: minLength,
		maxLength: maxLength,
	};

	return {
		kind: 'constraint',
		type: 'array_length',
		minLength: minLength,
		maxLength: maxLength,
		'~run'(input, _flags) {
			const length = input.length;

			if (length < minLength) {
				return issue;
			}

			if (length > maxLength) {
				return issue;
			}

			return undefined;
		},
	};
};
