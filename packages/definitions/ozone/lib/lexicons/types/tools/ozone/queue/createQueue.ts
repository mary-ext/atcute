import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneQueueDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.queue.createQueue', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Collection name for record subjects. Required if subjectTypes includes 'record'. */
			collection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nsidString()),
			/** Optional description of the queue */
			description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Display name for the queue (must be unique) */
			name: /*#__PURE__*/ v.string(),
			/**
			 * Report reason types (fully qualified NSIDs)
			 *
			 * @minLength 1
			 * @maxLength 25
			 */
			reportTypes: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
				/*#__PURE__*/ v.arrayLength(1, 25),
			]),
			/**
			 * Subject types this queue accepts
			 *
			 * @minLength 1
			 */
			subjectTypes: /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'account' | 'message' | 'record' | (string & {})>()),
				[/*#__PURE__*/ v.arrayLength(1)],
			),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get queue() {
				return ToolsOzoneQueueDefs.queueViewSchema;
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
		'tools.ozone.queue.createQueue': mainSchema;
	}
}
