import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.queue.routeReports', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** End of report ID range (inclusive). Difference between start and end must be less than 5,000. */
			endReportId: /*#__PURE__*/ v.integer(),
			/** Start of report ID range (inclusive). */
			startReportId: /*#__PURE__*/ v.integer(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** The number of reports assigned to a queue. */
			assigned: /*#__PURE__*/ v.integer(),
			/** The number of reports with no matching queue. */
			unmatched: /*#__PURE__*/ v.integer(),
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
		'tools.ozone.queue.routeReports': mainSchema;
	}
}
