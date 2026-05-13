import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.report.refreshStats', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** End date for recomputation, inclusive (YYYY-MM-DD). */
			endDate: /*#__PURE__*/ v.string(),
			/** Optional list of queue IDs to recompute. Omit to recompute all groups. */
			queueIds: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.integer())),
			/** Start date for recomputation, inclusive (YYYY-MM-DD). */
			startDate: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({}),
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
		'tools.ozone.report.refreshStats': mainSchema;
	}
}
