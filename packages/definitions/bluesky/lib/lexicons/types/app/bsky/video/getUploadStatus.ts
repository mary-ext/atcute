import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyVideoDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.video.getUploadStatus', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @minLength 1
		 * @maxLength 256
		 */
		jobId: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 256)]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Present only when state is completed; may differ from jobId on deduplication.
			 *
			 * @minLength 1
			 * @maxLength 256
			 */
			completedJobId: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 256)]),
			),
			expiresAt: /*#__PURE__*/ v.datetimeString(),
			/**
			 * Present only when state is failed.
			 *
			 * @maxLength 1024
			 */
			failureReason: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1024)]),
			),
			/**
			 * @minLength 1
			 * @maxLength 256
			 */
			jobId: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 256)]),
			/** Present only when state is completed. */
			get jobStatus() {
				return /*#__PURE__*/ v.optional(AppBskyVideoDefs.jobStatusSchema);
			},
			partCount: /*#__PURE__*/ v.integer(),
			partSizeBytes: /*#__PURE__*/ v.integer(),
			receivedParts: /*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
			),
			/** @maxLength 32 */
			state: /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<
					'aborted' | 'completed' | 'created' | 'expired' | 'failed' | 'finishing' | (string & {})
				>(),
				[/*#__PURE__*/ v.stringLength(0, 32)],
			),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.video.getUploadStatus': mainSchema;
	}
}
