import { isBytes, type Bytes } from '../../interfaces/bytes.js';

import type { BaseSchema, IssueLeaf } from '../base.js';

export interface BytesSchema extends BaseSchema<Bytes, Bytes> {
	readonly type: 'bytes';
}

const ISSUE_EXPECTED_BYTES: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'bytes',
};

const BYTES_SCHEMA: BytesSchema = {
	kind: 'schema',
	type: 'bytes',
	'~run'(input, _flags) {
		if (!isBytes(input)) {
			return ISSUE_EXPECTED_BYTES;
		}

		return undefined;
	},
};

// #__NO_SIDE_EFFECTS__
export const bytes = (): BytesSchema => {
	return BYTES_SCHEMA;
};
