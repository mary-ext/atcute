import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneQueueDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.queue.assignModerator', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** DID to be assigned. */
			did: /*#__PURE__*/ v.string(),
			/** The ID of the queue to assign the user to. */
			queueId: /*#__PURE__*/ v.integer(),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneQueueDefs.assignmentViewSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.queue.assignModerator': mainSchema;
	}
}
