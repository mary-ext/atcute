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
		get reasonTypes() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoModerationDefs.reasonTypeSchema));
		},
		subjectCollections: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString())),
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
