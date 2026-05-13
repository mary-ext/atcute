import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneReportDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.report.getLiveStats', {
	params: /*#__PURE__*/ v.object({
		/** Filter stats by moderator DID. */
		moderatorDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/** Filter stats by queue. Use -1 for unqueued reports. */
		queueId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/** Filter stats by report types. */
		reportTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Statistics for the requested filter. */
			get stats() {
				return ToolsOzoneReportDefs.liveStatsSchema;
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.report.getLiveStats': mainSchema;
	}
}
