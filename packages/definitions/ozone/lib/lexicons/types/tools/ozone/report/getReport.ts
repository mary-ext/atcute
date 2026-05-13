import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneReportDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.report.getReport', {
	params: /*#__PURE__*/ v.object({
		/** The ID of the report to retrieve. */
		id: /*#__PURE__*/ v.integer(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneReportDefs.reportViewSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.report.getReport': mainSchema;
	}
}
