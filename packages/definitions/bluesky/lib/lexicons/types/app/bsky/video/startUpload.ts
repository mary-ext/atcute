import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.video.startUpload', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Advisory, non-authoritative duration used only for early failure; the authoritative probe runs
			 * asynchronously after upload.
			 */
			durationMs: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Advisory, non-authoritative height used only for early failure; the authoritative probe runs
			 * asynchronously after upload.
			 */
			height: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Declared MIME type of the video.
			 *
			 * @minLength 3
			 * @maxLength 255
			 */
			mimeType: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(3, 255)]),
			/**
			 * Optional client-provided file name.
			 *
			 * @maxLength 256
			 */
			name: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 256)]),
			),
			/**
			 * Exact byte size of the complete upload-ready video file before it is split into parts.
			 *
			 * @minimum 1
			 */
			sizeBytes: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
			/**
			 * Advisory, non-authoritative width used only for early failure; the authoritative probe runs
			 * asynchronously after upload.
			 */
			width: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			expiresAt: /*#__PURE__*/ v.datetimeString(),
			/**
			 * @minLength 1
			 * @maxLength 256
			 */
			jobId: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 256)]),
			partCount: /*#__PURE__*/ v.integer(),
			partSizeBytes: /*#__PURE__*/ v.integer(),
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
		'app.bsky.video.startUpload': mainSchema;
	}
}
