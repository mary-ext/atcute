import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneReportDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.report.queryReports', {
	params: /*#__PURE__*/ v.object({
		/** Filter by the DID of the moderator permanently assigned to the report. */
		assignedTo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * If specified, reports where the subject belongs to the given collections will be returned. When
		 * subjectType is set to 'account', this will be ignored.
		 *
		 * @maxLength 20
		 */
		collections: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()), [
				/*#__PURE__*/ v.arrayLength(0, 20),
			]),
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Filter to reports where the subject is this DID or any record owned by this DID. Unlike `subject`
		 * (which scopes to a specific account or record), this returns all reports tied to the DID across both
		 * account-level and record-level subjects.
		 */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Filter by muted status. true returns only muted reports, false returns only unmuted reports. Defaults
		 * to false.
		 *
		 * @default false
		 */
		isMuted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** Filter by queue ID. Use -1 for unassigned reports. */
		queueId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Filter by report types (fully qualified string in the format of
		 * com.atproto.moderation.defs#reason<name>).
		 */
		reportTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** Retrieve reports created after a given timestamp */
		reportedAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/** Retrieve reports created before a given timestamp */
		reportedBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/** @default 'desc' */
		sortDirection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['asc', 'desc']), 'desc'),
		/** @default 'createdAt' */
		sortField: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['createdAt', 'updatedAt']), 'createdAt'),
		/** Filter by report status. */
		status: /*#__PURE__*/ v.string<'assigned' | 'closed' | 'escalated' | 'open' | 'queued' | (string & {})>(),
		/** Filter by subject DID or AT-URI. */
		subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/** If specified, reports of the given subject type will be returned. */
		subjectType: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'account' | 'conversation' | 'message' | 'record' | (string & {})>(),
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get reports() {
				return /*#__PURE__*/ v.array(ToolsOzoneReportDefs.reportViewSchema);
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
		'tools.ozone.report.queryReports': mainSchema;
	}
}
