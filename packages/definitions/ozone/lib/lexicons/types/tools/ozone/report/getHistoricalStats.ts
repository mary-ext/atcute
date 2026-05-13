import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneReportDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.report.getHistoricalStats', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Latest date to include (inclusive). */
		endDate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Maximum number of entries to return.
		 *
		 * @default 30
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			30,
		),
		/** Filter stats by moderator DID. */
		moderatorDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/** Filter stats by queue. Use -1 for unqueued reports. */
		queueId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/** Filter stats by report types. */
		reportTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** Earliest date to include (inclusive). */
		startDate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get stats() {
				return /*#__PURE__*/ v.array(ToolsOzoneReportDefs.historicalStatsSchema);
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
		'tools.ozone.report.getHistoricalStats': mainSchema;
	}
}
