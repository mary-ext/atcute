import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneReportDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.report.queryActivities', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Filter to specific activity types (e.g. closeActivity, escalationActivity). If omitted, all types are
		 * returned.
		 */
		activityTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** Retrieve activities created at or after a given timestamp */
		createdAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/** Retrieve activities created at or before a given timestamp */
		createdBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/** Cursor of the form `<createdAtMs>::<activityId>`. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** @default 'desc' */
		sortDirection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['asc', 'desc']), 'desc'),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get activities() {
				return /*#__PURE__*/ v.array(ToolsOzoneReportDefs.reportActivityViewSchema);
			},
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'tools.ozone.report.queryActivities': mainSchema;
	}
}
