import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.moderation.queryStatuses', {
	params: /*#__PURE__*/ v.object({
		appealed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		collections: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()), [
				/*#__PURE__*/ v.arrayLength(0, 20),
			]),
		),
		comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		excludeTags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		hostingDeletedAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		hostingDeletedBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		hostingStatuses: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		hostingUpdatedAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		hostingUpdatedBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		ignoreSubjects: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.genericUriString())),
		includeAllUserRecords: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		includeMuted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		lastReviewedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		minAccountSuspendCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		minPriorityScore: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
		),
		minReportedRecordsCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		minTakendownRecordsCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		onlyMuted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		queueCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		queueIndex: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		queueSeed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		reportedAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		reportedBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		reviewState: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		reviewedAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		reviewedBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		sortDirection: /*#__PURE__*/ v.literalEnum(['asc', 'desc']),
		sortField: /*#__PURE__*/ v.literalEnum([
			'lastReportedAt',
			'lastReviewedAt',
			'priorityScore',
			'reportedRecordsCount',
			'takendownRecordsCount',
		]),
		subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		subjectType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'account' | 'record' | (string & {})>()),
		tags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
				/*#__PURE__*/ v.arrayLength(0, 25),
			]),
		),
		takendown: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get subjectStatuses() {
				return /*#__PURE__*/ v.array(ToolsOzoneModerationDefs.subjectStatusViewSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.moderation.queryStatuses': mainSchema;
	}
}
