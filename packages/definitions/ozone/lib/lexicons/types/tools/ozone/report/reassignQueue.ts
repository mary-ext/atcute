import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneReportDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.report.reassignQueue', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Optional moderator-only note recorded on the resulting queueActivity as internalNote. */
			comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Target queue ID. Use -1 to unassign from any queue. */
			queueId: /*#__PURE__*/ v.integer(),
			/** ID of the report to reassign */
			reportId: /*#__PURE__*/ v.integer(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get report() {
				return ToolsOzoneReportDefs.reportViewSchema;
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
		'tools.ozone.report.reassignQueue': mainSchema;
	}
}
