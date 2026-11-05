import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitOid from '../../../git/oid.ts';
import * as OrgTangledReviewUnspeccedDefs from '../../../review/unspecced/defs.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.repo.review.unspecced.round'),
		/** ID of commit that is getting reviewed. */
		get commit() {
			return OrgTangledGitOid.mainSchema;
		},
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/** Self-label values for this record. Most common use-case is 'bot'. */
		get labels() {
			return /*#__PURE__*/ v.optional(ComAtprotoLabelDefs.selfLabelsSchema);
		},
		/** The reviewed state of that commit. This is one and only meaningful content of this record. */
		get state() {
			return OrgTangledReviewUnspeccedDefs.reviewStateSchema;
		},
		/** ticket-id */
		subject: /*#__PURE__*/ v.recordKeyString(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.repo.review.unspecced.round': mainSchema;
	}
}
