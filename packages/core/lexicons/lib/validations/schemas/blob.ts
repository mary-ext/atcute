import { isBlob, isLegacyBlob, type Blob, type LegacyBlob } from '../../interfaces/blob.js';

import type { BaseSchema, IssueLeaf } from '../base.js';

export interface BlobSchema extends BaseSchema<Blob | LegacyBlob, Blob> {
	readonly type: 'blob';
}

const ISSUE_EXPECTED_BLOB: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'blob',
};

const BLOB_SCHEMA: BlobSchema = {
	kind: 'schema',
	type: 'blob',
	'~run'(input, _flags) {
		if (typeof input !== 'object' || input === null) {
			return ISSUE_EXPECTED_BLOB;
		}

		if (isBlob(input)) {
			return undefined;
		}

		if (isLegacyBlob(input)) {
			const blob: Blob = {
				$type: 'blob',
				mimeType: input.mimeType,
				ref: { $link: input.cid },
				size: -1,
			};

			return { ok: true, value: blob };
		}

		return ISSUE_EXPECTED_BLOB;
	},
};

// #__NO_SIDE_EFFECTS__
export const blob = (): BlobSchema => {
	return BLOB_SCHEMA;
};
