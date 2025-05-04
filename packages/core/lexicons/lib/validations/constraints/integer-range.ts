import type { BaseConstraint, IssueLeaf } from '../base.js';

export interface IntegerRangeConstraint<TInput extends number> extends BaseConstraint<TInput> {
	readonly type: 'integer_range';
	readonly min: number;
	readonly max: number;
}

// #__NO_SIDE_EFFECTS__
export const integerRange = <TInput extends number>(
	min: number,
	max: number = Infinity,
): IntegerRangeConstraint<TInput> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_integer_range',
		min: min,
		max: max,
	};

	return {
		kind: 'constraint',
		type: 'integer_range',
		min: min,
		max: max,
		'~run'(input, _flags) {
			if (input < min) {
				return issue;
			}

			if (input > max) {
				return issue;
			}

			return undefined;
		},
	};
};
