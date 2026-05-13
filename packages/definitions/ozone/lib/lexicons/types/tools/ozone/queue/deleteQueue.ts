import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.queue.deleteQueue', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Optional: migrate all reports to this queue. If not specified, reports will be set to unassigned
			 * (-1).
			 */
			migrateToQueueId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** ID of the queue to delete */
			queueId: /*#__PURE__*/ v.integer(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			deleted: /*#__PURE__*/ v.boolean(),
			/** Number of reports that were migrated (if migration occurred) */
			reportsMigrated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
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
		'tools.ozone.queue.deleteQueue': mainSchema;
	}
}
