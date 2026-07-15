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
	/**
	 * Percentage of reports actioned (actionedCount / inboundCount * 100), rounded to nearest integer. Absent
	 * when inboundCount is 0.
	 */
	actionRate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of reports in 'closed' status */
	actionedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Average time in seconds from report creation to close, for reports closed in this period. */
	avgHandlingTimeSec: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of reports in 'escalated' status */
	escalatedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Reports received in this queue in the last 24 hours. */
	inboundCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** When these statistics were last computed */
	lastUpdated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Number of reports in 'open' status */
	pendingCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _queueViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.queue.defs#queueView')),
	/** Collection name for record subjects (e.g., 'app.bsky.feed.post') */
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
	/** Report reason types this queue accepts (fully qualified NSIDs) */
	reportTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	/** Statistics about this queue */
	get stats() {
		return queueStatsSchema;
	},
	/** Subject types this queue accepts. */
	subjectTypes: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'account' | 'message' | 'record' | (string & {})>()),
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
