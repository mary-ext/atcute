import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneReportDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.report.createActivity', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** The type of activity to record. */
			get activity() {
				return /*#__PURE__*/ v.variant([
					ToolsOzoneReportDefs.assignmentActivitySchema,
					ToolsOzoneReportDefs.closeActivitySchema,
					ToolsOzoneReportDefs.escalationActivitySchema,
					ToolsOzoneReportDefs.noteActivitySchema,
					ToolsOzoneReportDefs.queueActivitySchema,
					ToolsOzoneReportDefs.reopenActivitySchema,
				]);
			},
			/**
			 * ID of the report moderation event. Resolves to the report created from that event. Exactly one of
			 * reportId or eventId must be provided.
			 */
			eventId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** Optional moderator-only note. Not visible to reporters. */
			internalNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Set true when this activity is triggered by an automated process. Defaults to false.
			 *
			 * @default false
			 */
			isAutomated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
			/** Optional public-facing note, potentially visible to the reporter. */
			publicNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** ID of the report to record activity on. Exactly one of reportId or eventId must be provided. */
			reportId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get activity() {
				return ToolsOzoneReportDefs.reportActivityViewSchema;
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
		'tools.ozone.report.createActivity': mainSchema;
	}
}
