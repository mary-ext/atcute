import type { BaseSchema, IssueLeaf } from '../base.js';

export interface BooleanSchema extends BaseSchema<boolean> {
	readonly type: 'boolean';
}

const ISSUE_TYPE_BOOLEAN: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'boolean',
};

const BOOLEAN_SCHEMA: BooleanSchema = {
	kind: 'schema',
	type: 'boolean',
	'~run'(input, _flags) {
		if (typeof input !== 'boolean') {
			return ISSUE_TYPE_BOOLEAN;
		}

		return undefined;
	},
};

// #__NO_SIDE_EFFECTS__
export const boolean = (): BooleanSchema => {
	return BOOLEAN_SCHEMA;
};
