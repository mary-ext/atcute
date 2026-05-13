import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneQueueDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.queue.updateQueue', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Optional description of the queue */
			description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Enable or disable the queue */
			enabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/** New display name for the queue */
			name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** ID of the queue to update */
			queueId: /*#__PURE__*/ v.integer(),
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
		'tools.ozone.queue.updateQueue': mainSchema;
	}
}
