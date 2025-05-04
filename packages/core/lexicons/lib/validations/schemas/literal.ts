import type { BaseSchema, IssueLeaf, Literal } from '../base.js';

export interface LiteralSchema<T extends Literal> extends BaseSchema<T> {
	readonly type: 'literal';
	readonly expected: T;
}

export interface LiteralUnionSchema<T extends Literal> extends BaseSchema<T> {
	readonly type: 'literal_union';
	readonly expected: readonly T[];
}

// #__NO_SIDE_EFFECTS__
export const literal = <T extends Literal>(value: T): LiteralSchema<T> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_literal',
		expected: [value],
	};

	return {
		kind: 'schema',
		type: 'literal',
		expected: value,
		'~run'(input, _flags) {
			if (input !== value) {
				return issue;
			}

			return undefined;
		},
	};
};

// #__NO_SIDE_EFFECTS__
export const literalUnion = <T extends Literal>(values: T[]): LiteralUnionSchema<T> => {
	const issue: IssueLeaf = {
		ok: false,
		code: 'invalid_literal',
		expected: values,
	};

	return {
		kind: 'schema',
		type: 'literal_union',
		expected: values,
		'~run'(input, _flags) {
			if (!values.includes(input as any)) {
				return issue;
			}

			return undefined;
		},
	};
};
