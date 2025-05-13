import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.video.getUploadLimits', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			canUpload: /*#__PURE__*/ v.boolean(),
			remainingDailyVideos: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			remainingDailyBytes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.video.getUploadLimits': mainSchema;
	}
}
