import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneTeamDefs from '../team/defs.ts';

const _assignmentViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.queue.defs#assignmentView')),
	did: /*#__PURE__*/ v.didString(),
	endAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	id: /*#__PURE__*/ v.integer(),
	/** The moderator assigned to this queue */
	get moderator() {
		return /*#__PURE__*/ v.optional(ToolsOzoneTeamDefs.memberSchema);
	},
	get queue() {
		return queueViewSchema;
	},
	startAt: /*#__PURE__*/ v.datetimeString(),
});
const _queueStatsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.queue.defs#queueStats')),
	/** Number of closures whose last report action is not label, tag, or takedown. */
	acknowledgedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Percentage of closures actioned (actionedCount / closedCount * 100), rounded to nearest integer. */
	actionRate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of closures whose last report action is label, tag, or takedown. */
	actionedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Sum of report assignment-to-close seconds. */
	ahtDurationSec: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of assigned closed-report samples in ahtDurationSec. */
	ahtSampleCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Average handling time in seconds from report assignment to close. */
	avgHandlingTimeSec: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Average resolution time in seconds from report creation to close. */
	avgResolutionTimeSec: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of reports whose current closure falls within this UTC calendar day. */
	closedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * Reports whose closure meets their closure target.
	 *
	 * @minimum 0
	 */
	closureTargetMetCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * Percent of reports meeting their closure target.
	 *
	 * @minimum 0
	 * @maximum 100
	 */
	closureTargetMetRate: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
	),
	/**
	 * Reports whose closure exceeds their closure target.
	 *
	 * @minimum 0
	 */
	closureTargetMissedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * Unmuted pending reports past their closure target.
	 *
	 * @minimum 0
	 */
	closureTargetOverdueCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of report escalation events during this UTC calendar day. */
	escalatedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Reports received in this queue during this UTC calendar day. */
	inboundCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Closures whose last report action is a label event. */
	labelActionCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** When these statistics were last computed. */
	lastUpdated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Number of unmuted reports currently not closed. */
	pendingCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Sum of report creation-to-close seconds. */
	resolutionDurationSec: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of closed-report samples in resolutionDurationSec. */
	resolutionSampleCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Closures whose last report action is a tag event. */
	tagActionCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Closures whose last report action is a takedown event. */
	takedownActionCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _queueViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.queue.defs#queueView')),
	/**
	 * Match tags on the account that is being reported against. For record subjects, use the author account.
	 * Match any listed tag.
	 *
	 * @maxLength 25
	 */
	accountTags: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1)]),
			),
			[/*#__PURE__*/ v.arrayLength(0, 25)],
		),
	),
	/** Collection name for record subjects. Omit to accept every collection. */
	collection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nsidString()),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** DID of moderator who created this queue */
	createdBy: /*#__PURE__*/ v.didString(),
	/** When the queue was deleted, if applicable */
	deletedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Optional description of the queue */
	description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Whether this queue is currently active */
	enabled: /*#__PURE__*/ v.boolean(),
	/** Queue ID */
	id: /*#__PURE__*/ v.integer(),
	/** Display name of the queue */
	name: /*#__PURE__*/ v.string(),
	/** Labels recommended for this queue and used as a fallback when routing label appeals */
	recommendedLabels: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	/** Policy keys recommended when actioning reports in this queue */
	recommendedPolicies: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	/** Report reason types this queue accepts (fully qualified NSIDs) */
	reportTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	/**
	 * Match any listed tag on the account submitting the report.
	 *
	 * @maxLength 25
	 */
	reporterTags: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1)]),
			),
			[/*#__PURE__*/ v.arrayLength(0, 25)],
		),
	),
	/** Statistics about this queue */
	get stats() {
		return queueStatsSchema;
	},
	/**
	 * Admins can always list this queue and browse its reports. Other roles require an active queue assignment.
	 * Individual report and moderation event access is unchanged.
	 */
	strictAccess: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/** Subject types this queue accepts. */
	subjectTypes: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.array(
			/*#__PURE__*/ v.string<'account' | 'conversation' | 'message' | 'record' | (string & {})>(),
		),
	),
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});

type assignmentView$schematype = typeof _assignmentViewSchema;
type queueStats$schematype = typeof _queueStatsSchema;
type queueView$schematype = typeof _queueViewSchema;

export interface assignmentViewSchema extends assignmentView$schematype {}
export interface queueStatsSchema extends queueStats$schematype {}
export interface queueViewSchema extends queueView$schematype {}

export const assignmentViewSchema = _assignmentViewSchema as assignmentViewSchema;
export const queueStatsSchema = _queueStatsSchema as queueStatsSchema;
export const queueViewSchema = _queueViewSchema as queueViewSchema;

export interface AssignmentView extends v.InferInput<typeof assignmentViewSchema> {}
export interface QueueStats extends v.InferInput<typeof queueStatsSchema> {}
export interface QueueView extends v.InferInput<typeof queueViewSchema> {}
