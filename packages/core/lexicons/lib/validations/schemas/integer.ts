import type { BaseSchema, IssueLeaf } from '../base.js';

export interface IntegerSchema extends BaseSchema<number> {
	readonly type: 'integer';
}

const ISSUE_TYPE_INTEGER: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'integer',
};

const INTEGER_SCHEMA: IntegerSchema = {
	kind: 'schema',
	type: 'integer',
	'~run'(input, _flags) {
		if (typeof input !== 'number') {
			return ISSUE_TYPE_INTEGER;
		}

		if (input < 0 || !Number.isSafeInteger(input)) {
			return ISSUE_TYPE_INTEGER;
		}

		return undefined;
	},
};

// #__NO_SIDE_EFFECTS__
export const integer = (): IntegerSchema => {
	return INTEGER_SCHEMA;
};
