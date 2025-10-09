import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyLabelerDefs from './defs.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoModerationDefs from '@atcute/atproto/types/moderation/defs';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal('self'),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.labeler.service'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get labels() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]));
		},
		get policies() {
			return AppBskyLabelerDefs.labelerPoliciesSchema;
		},
		/**
		 * The set of report reason 'codes' which are in-scope for this service to review and action. These usually align to policy categories. If not defined (distinct from empty array), all reason types are allowed.
		 */
		get reasonTypes() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoModerationDefs.reasonTypeSchema));
		},
		/**
		 * Set of record types (collection NSIDs) which can be reported to this service. If not defined (distinct from empty array), default is any record type.
		 */
		subjectCollections: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString())),
		/**
		 * The set of subject types (account, record, etc) this service accepts reports on.
		 */
		get subjectTypes() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoModerationDefs.subjectTypeSchema));
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.labeler.service': mainSchema;
	}
}
