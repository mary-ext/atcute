import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.video.abortUpload', {
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
			 * Present only when state is completed.
			 *
			 * @minLength 1
			 * @maxLength 256
			 */
			completedJobId: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 256)]),
			),
			/**
			 * Present only when state is failed.
			 *
			 * @maxLength 1024
			 */
			failureReason: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1024)]),
			),
			/** @maxLength 32 */
			state: /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<'aborted' | 'completed' | 'expired' | 'failed' | (string & {})>(),
				[/*#__PURE__*/ v.stringLength(0, 32)],
			),
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
		'app.bsky.video.abortUpload': mainSchema;
	}
}
