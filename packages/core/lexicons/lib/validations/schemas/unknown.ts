import type { BaseSchema, IssueLeaf } from '../base.js';

export interface UnknownSchema extends BaseSchema<Record<string, unknown>> {
	readonly type: 'unknown';
}

const ISSUE_TYPE_UNKNOWN: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'unknown',
};

const UNKNOWN_SCHEMA: UnknownSchema = {
	kind: 'schema',
	type: 'unknown',
	'~run'(input, _flags) {
		if (typeof input !== 'object' || input === null) {
			return ISSUE_TYPE_UNKNOWN;
		}

		return undefined;
	},
};

// #__NO_SIDE_EFFECTS__
export const unknown = (): UnknownSchema => {
	return UNKNOWN_SCHEMA;
};
