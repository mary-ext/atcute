import { isCidLink, type CidLink } from '../../interfaces/cid-link.js';

import type { BaseSchema, IssueLeaf } from '../base.js';

export interface CidLinkSchema extends BaseSchema<CidLink, CidLink> {
	readonly type: 'cid_link';
}

const ISSUE_EXPECTED_CID_LINK: IssueLeaf = {
	ok: false,
	code: 'invalid_type',
	expected: 'cid-link',
};

const CID_LINK_SCHEMA: CidLinkSchema = {
	kind: 'schema',
	type: 'cid_link',
	'~run'(input, _flags) {
		if (!isCidLink(input)) {
			return ISSUE_EXPECTED_CID_LINK;
		}

		return undefined;
	},
};

// #__NO_SIDE_EFFECTS__
export const cidLink = (): CidLinkSchema => {
	return CID_LINK_SCHEMA;
};
