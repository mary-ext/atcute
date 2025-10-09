import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.moderation.queryStatuses', {
	params: /*#__PURE__*/ v.object({
		/**
		 * If specified, only subjects with the given age assurance state will be returned.
		 */
		ageAssuranceState: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'assured' | 'blocked' | 'pending' | 'reset' | 'unknown' | (string & {})>(),
		),
		/**
		 * Get subjects in unresolved appealed status
		 */
		appealed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * If specified, subjects belonging to the given collections will be returned. When subjectType is set to 'account', this will be ignored.
		 * @maxLength 20
		 */
		collections: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()), [
				/*#__PURE__*/ v.arrayLength(0, 20),
			]),
		),
		/**
		 * Search subjects by keyword from comments
		 */
		comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		excludeTags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * Search subjects where the associated record/account was deleted after a given timestamp
		 */
		hostingDeletedAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Search subjects where the associated record/account was deleted before a given timestamp
		 */
		hostingDeletedBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Search subjects by the status of the associated record/account
		 */
		hostingStatuses: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * Search subjects where the associated record/account was updated after a given timestamp
		 */
		hostingUpdatedAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Search subjects where the associated record/account was updated before a given timestamp
		 */
		hostingUpdatedBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		ignoreSubjects: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.genericUriString())),
		/**
		 * All subjects, or subjects from given 'collections' param, belonging to the account specified in the 'subject' param will be returned.
		 */
		includeAllUserRecords: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * By default, we don't include muted subjects in the results. Set this to true to include them.
		 */
		includeMuted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Get all subject statuses that were reviewed by a specific moderator
		 */
		lastReviewedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * If specified, only subjects that belong to an account that has at least this many suspensions will be returned.
		 */
		minAccountSuspendCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * If specified, only subjects that have priority score value above the given value will be returned.
		 * @minimum 0
		 * @maximum 100
		 */
		minPriorityScore: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
		),
		/**
		 * If specified, only subjects that belong to an account that has at least this many reported records will be returned.
		 */
		minReportedRecordsCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * If specified, only subjects that belong to an account that has at least this many taken down records will be returned.
		 */
		minTakendownRecordsCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * When set to true, only muted subjects and reporters will be returned.
		 */
		onlyMuted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Number of queues being used by moderators. Subjects will be split among all queues.
		 */
		queueCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Index of the queue to fetch subjects from. Works only when queueCount value is specified.
		 */
		queueIndex: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * A seeder to shuffle/balance the queue items.
		 */
		queueSeed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Search subjects reported after a given timestamp
		 */
		reportedAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Search subjects reported before a given timestamp
		 */
		reportedBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Specify when fetching subjects in a certain state
		 */
		reviewState: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Search subjects reviewed after a given timestamp
		 */
		reviewedAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Search subjects reviewed before a given timestamp
		 */
		reviewedBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * @default "desc"
		 */
		sortDirection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['asc', 'desc']), 'desc'),
		/**
		 * @default "lastReportedAt"
		 */
		sortField: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.literalEnum([
				'lastReportedAt',
				'lastReviewedAt',
				'priorityScore',
				'reportedRecordsCount',
				'takendownRecordsCount',
			]),
			'lastReportedAt',
		),
		/**
		 * The subject to get the status for.
		 */
		subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * If specified, subjects of the given type (account or record) will be returned. When this is set to 'account' the 'collections' parameter will be ignored. When includeAllUserRecords or subject is set, this will be ignored.
		 */
		subjectType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'account' | 'record' | (string & {})>()),
		/**
		 * @maxLength 25
		 */
		tags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
				/*#__PURE__*/ v.arrayLength(0, 25),
			]),
		),
		/**
		 * Get subjects that were taken down
		 */
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

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.moderation.queryStatuses': mainSchema;
	}
}
