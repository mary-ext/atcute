import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyVideoDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.video.finishUpload', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * @minLength 1
			 * @maxLength 256
			 */
			jobId: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 256)]),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The processing job to poll with getJobStatus; on deduplication this may differ from the input jobId.
			 *
			 * @minLength 1
			 * @maxLength 256
			 */
			completedJobId: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(1, 256),
			]),
			get jobStatus() {
				return AppBskyVideoDefs.jobStatusSchema;
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'app.bsky.video.finishUpload': mainSchema;
	}
}
