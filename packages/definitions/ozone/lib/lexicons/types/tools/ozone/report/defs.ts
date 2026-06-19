import * as ComAtprotoModerationDefs from '@atcute/atproto/types/moderation/defs';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneModerationDefs from '../moderation/defs.ts';
import * as ToolsOzoneQueueDefs from '../queue/defs.ts';
import * as ToolsOzoneTeamDefs from '../team/defs.ts';

const _assignmentActivitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#assignmentActivity')),
	/**
	 * The report's status before this activity. Populated automatically from the report row; not required in
	 * input.
	 */
	previousStatus: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'assigned' | 'closed' | 'escalated' | 'open' | 'queued' | (string & {})>(),
	),
});
const _assignmentViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#assignmentView')),
	did: /*#__PURE__*/ v.didString(),
	endAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	id: /*#__PURE__*/ v.integer(),
	/** The moderator assigned to this report */
	get moderator() {
		return /*#__PURE__*/ v.optional(ToolsOzoneTeamDefs.memberSchema);
	},
	get queue() {
		return /*#__PURE__*/ v.optional(ToolsOzoneQueueDefs.queueViewSchema);
	},
	reportId: /*#__PURE__*/ v.integer(),
	startAt: /*#__PURE__*/ v.datetimeString(),
});
const _closeActivitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#closeActivity')),
	/**
	 * The report's status before this activity. Populated automatically from the report row; not required in
	 * input.
	 */
	previousStatus: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'assigned' | 'closed' | 'escalated' | 'open' | 'queued' | (string & {})>(),
	),
});
const _escalationActivitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#escalationActivity')),
	/**
	 * The report's status before this activity. Populated automatically from the report row; not required in
	 * input.
	 */
	previousStatus: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'assigned' | 'closed' | 'escalated' | 'open' | 'queued' | (string & {})>(),
	),
});
const _historicalStatsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#historicalStats')),
	/** Percentage of reports actioned (actionedCount / inboundCount * 100), rounded to nearest integer. */
	actionRate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of reports closed during this day. */
	actionedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Average time in seconds from report creation (or moderator assignment) to close. */
	avgHandlingTimeSec: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** When this snapshot was last computed. */
	computedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** The calendar date this snapshot covers (YYYY-MM-DD). */
	date: /*#__PURE__*/ v.string(),
	/** Number of reports escalated during this day. */
	escalatedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Reports received during this day. */
	inboundCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of reports not closed at time of computation. */
	pendingCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _liveStatsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#liveStats')),
	/** Percentage of reports actioned (actionedCount / inboundCount * 100), rounded to nearest integer. */
	actionRate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of reports closed today. */
	actionedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Average time in seconds from report creation (or moderator assignment) to close. */
	avgHandlingTimeSec: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of reports escalated today. */
	escalatedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Reports received today. */
	inboundCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** When these statistics were last computed. */
	lastUpdated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Number of reports currently not closed. */
	pendingCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _noteActivitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#noteActivity')),
});
const _queueActivitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#queueActivity')),
	/**
	 * The report's status before this activity. Populated automatically from the report row; not required in
	 * input.
	 */
	previousStatus: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'assigned' | 'closed' | 'escalated' | 'open' | 'queued' | (string & {})>(),
	),
});
const _reasonAppealSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonAppeal');
const _reasonChildSafetyCSAMSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonChildSafetyCSAM');
const _reasonChildSafetyGroomSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyGroom',
);
const _reasonChildSafetyHarassmentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyHarassment',
);
const _reasonChildSafetyOtherSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyOther',
);
const _reasonChildSafetyPrivacySchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonChildSafetyPrivacy',
);
const _reasonHarassmentDoxxingSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonHarassmentDoxxing',
);
const _reasonHarassmentHateSpeechSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonHarassmentHateSpeech',
);
const _reasonHarassmentOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonHarassmentOther');
const _reasonHarassmentTargetedSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonHarassmentTargeted',
);
const _reasonHarassmentTrollSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonHarassmentTroll');
const _reasonMisleadingBotSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonMisleadingBot');
const _reasonMisleadingElectionsSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonMisleadingElections',
);
const _reasonMisleadingImpersonationSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonMisleadingImpersonation',
);
const _reasonMisleadingOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonMisleadingOther');
const _reasonMisleadingScamSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonMisleadingScam');
const _reasonMisleadingSpamSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonMisleadingSpam');
const _reasonOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonOther');
const _reasonRuleBanEvasionSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonRuleBanEvasion');
const _reasonRuleOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonRuleOther');
const _reasonRuleProhibitedSalesSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonRuleProhibitedSales',
);
const _reasonRuleSiteSecuritySchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonRuleSiteSecurity',
);
const _reasonSelfHarmContentSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSelfHarmContent');
const _reasonSelfHarmEDSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSelfHarmED');
const _reasonSelfHarmOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSelfHarmOther');
const _reasonSelfHarmStuntsSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSelfHarmStunts');
const _reasonSelfHarmSubstancesSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonSelfHarmSubstances',
);
const _reasonSexualAbuseContentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonSexualAbuseContent',
);
const _reasonSexualAnimalSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualAnimal');
const _reasonSexualDeepfakeSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualDeepfake');
const _reasonSexualNCIISchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualNCII');
const _reasonSexualOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualOther');
const _reasonSexualUnlabeledSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonSexualUnlabeled');
const _reasonTypeSchema = /*#__PURE__*/ v.string<
	| 'tools.ozone.report.defs#reasonAppeal'
	| 'tools.ozone.report.defs#reasonChildSafetyCSAM'
	| 'tools.ozone.report.defs#reasonChildSafetyGroom'
	| 'tools.ozone.report.defs#reasonChildSafetyHarassment'
	| 'tools.ozone.report.defs#reasonChildSafetyOther'
	| 'tools.ozone.report.defs#reasonChildSafetyPrivacy'
	| 'tools.ozone.report.defs#reasonHarassmentDoxxing'
	| 'tools.ozone.report.defs#reasonHarassmentHateSpeech'
	| 'tools.ozone.report.defs#reasonHarassmentOther'
	| 'tools.ozone.report.defs#reasonHarassmentTargeted'
	| 'tools.ozone.report.defs#reasonHarassmentTroll'
	| 'tools.ozone.report.defs#reasonMisleadingBot'
	| 'tools.ozone.report.defs#reasonMisleadingElections'
	| 'tools.ozone.report.defs#reasonMisleadingImpersonation'
	| 'tools.ozone.report.defs#reasonMisleadingOther'
	| 'tools.ozone.report.defs#reasonMisleadingScam'
	| 'tools.ozone.report.defs#reasonMisleadingSpam'
	| 'tools.ozone.report.defs#reasonOther'
	| 'tools.ozone.report.defs#reasonRuleBanEvasion'
	| 'tools.ozone.report.defs#reasonRuleOther'
	| 'tools.ozone.report.defs#reasonRuleProhibitedSales'
	| 'tools.ozone.report.defs#reasonRuleSiteSecurity'
	| 'tools.ozone.report.defs#reasonSelfHarmContent'
	| 'tools.ozone.report.defs#reasonSelfHarmED'
	| 'tools.ozone.report.defs#reasonSelfHarmOther'
	| 'tools.ozone.report.defs#reasonSelfHarmStunts'
	| 'tools.ozone.report.defs#reasonSelfHarmSubstances'
	| 'tools.ozone.report.defs#reasonSexualAbuseContent'
	| 'tools.ozone.report.defs#reasonSexualAnimal'
	| 'tools.ozone.report.defs#reasonSexualDeepfake'
	| 'tools.ozone.report.defs#reasonSexualNCII'
	| 'tools.ozone.report.defs#reasonSexualOther'
	| 'tools.ozone.report.defs#reasonSexualUnlabeled'
	| 'tools.ozone.report.defs#reasonViolenceAnimal'
	| 'tools.ozone.report.defs#reasonViolenceExtremistContent'
	| 'tools.ozone.report.defs#reasonViolenceGlorification'
	| 'tools.ozone.report.defs#reasonViolenceGraphicContent'
	| 'tools.ozone.report.defs#reasonViolenceOther'
	| 'tools.ozone.report.defs#reasonViolenceThreats'
	| 'tools.ozone.report.defs#reasonViolenceTrafficking'
	| (string & {})
>();
const _reasonViolenceAnimalSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonViolenceAnimal');
const _reasonViolenceExtremistContentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceExtremistContent',
);
const _reasonViolenceGlorificationSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceGlorification',
);
const _reasonViolenceGraphicContentSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceGraphicContent',
);
const _reasonViolenceOtherSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonViolenceOther');
const _reasonViolenceThreatsSchema = /*#__PURE__*/ v.literal('tools.ozone.report.defs#reasonViolenceThreats');
const _reasonViolenceTraffickingSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.report.defs#reasonViolenceTrafficking',
);
const _reopenActivitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#reopenActivity')),
	/**
	 * The report's status before this activity. Populated automatically from the report row; not required in
	 * input.
	 */
	previousStatus: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'assigned' | 'closed' | 'escalated' | 'open' | 'queued' | (string & {})>(),
	),
});
const _reportActivityViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#reportActivityView')),
	/** The typed activity object describing what occurred. */
	get activity() {
		return /*#__PURE__*/ v.variant([
			assignmentActivitySchema,
			closeActivitySchema,
			escalationActivitySchema,
			noteActivitySchema,
			queueActivitySchema,
			reopenActivitySchema,
		]);
	},
	/** When this activity was created */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** DID of the actor who created this activity, or the service DID for automated activities. */
	createdBy: /*#__PURE__*/ v.didString(),
	/** Activity ID */
	id: /*#__PURE__*/ v.integer(),
	/** Optional moderator-only note. Not visible to reporters. */
	internalNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * True if this activity was created by an automated process (e.g. queue router) rather than a direct human
	 * action.
	 */
	isAutomated: /*#__PURE__*/ v.boolean(),
	/** Extensible JSON payload for loose activity-specific metadata (e.g. assignmentId). */
	meta: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
	/** Full member record of the moderator who created this activity */
	get moderator() {
		return /*#__PURE__*/ v.optional(ToolsOzoneTeamDefs.memberSchema);
	},
	/** Optional public note, potentially visible to the reporter. */
	publicNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Full view of the report this activity belongs to. */
	get report() {
		return /*#__PURE__*/ v.optional(reportViewSchema);
	},
	/** ID of the report this activity belongs to */
	reportId: /*#__PURE__*/ v.integer(),
});
const _reportAssignmentSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#reportAssignment')),
	/** When the report was assigned */
	assignedAt: /*#__PURE__*/ v.datetimeString(),
	/** DID of the assigned moderator */
	did: /*#__PURE__*/ v.didString(),
	/** Full member record of the assigned moderator */
	get moderator() {
		return /*#__PURE__*/ v.optional(ToolsOzoneTeamDefs.memberSchema);
	},
});
const _reportViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.report.defs#reportView')),
	/** Array of moderation event IDs representing actions taken on this report (sorted DESC, most recent first) */
	actionEventIds: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.integer())),
	/** Note sent to reporter when report was actioned */
	actionNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Optional: expanded action events */
	get actions() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ToolsOzoneModerationDefs.modEventViewSchema));
	},
	/** Information about moderator currently assigned to this report (if any) */
	get assignment() {
		return /*#__PURE__*/ v.optional(reportAssignmentSchema);
	},
	/** Comment provided by the reporter */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** When the report was created */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** ID of the moderation event that created this report */
	eventId: /*#__PURE__*/ v.integer(),
	/** Report ID */
	id: /*#__PURE__*/ v.integer(),
	/**
	 * Whether this report is muted. A report is muted if the reporter was muted or the subject was muted at the
	 * time the report was created.
	 */
	isMuted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/** The queue this report is assigned to (if any) */
	get queue() {
		return /*#__PURE__*/ v.optional(ToolsOzoneQueueDefs.queueViewSchema);
	},
	/** When the report was assigned to its current queue */
	queuedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Number of other pending reports on the same subject */
	relatedReportCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Type of report */
	get reportType() {
		return ComAtprotoModerationDefs.reasonTypeSchema;
	},
	/** DID of the user who made the report */
	reportedBy: /*#__PURE__*/ v.didString(),
	/** Full subject view of the reporter account */
	get reporter() {
		return ToolsOzoneModerationDefs.subjectViewSchema;
	},
	/** Current status of the report */
	status: /*#__PURE__*/ v.string<'assigned' | 'closed' | 'escalated' | 'open' | 'queued' | (string & {})>(),
	/** The subject that was reported with full details */
	get subject() {
		return ToolsOzoneModerationDefs.subjectViewSchema;
	},
	/** Current status of the reported subject */
	get subjectStatus() {
		return /*#__PURE__*/ v.optional(ToolsOzoneModerationDefs.subjectStatusViewSchema);
	},
	/** When the report was last updated */
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});

type assignmentActivity$schematype = typeof _assignmentActivitySchema;
type assignmentView$schematype = typeof _assignmentViewSchema;
type closeActivity$schematype = typeof _closeActivitySchema;
type escalationActivity$schematype = typeof _escalationActivitySchema;
type historicalStats$schematype = typeof _historicalStatsSchema;
type liveStats$schematype = typeof _liveStatsSchema;
type noteActivity$schematype = typeof _noteActivitySchema;
type queueActivity$schematype = typeof _queueActivitySchema;
type reasonAppeal$schematype = typeof _reasonAppealSchema;
type reasonChildSafetyCSAM$schematype = typeof _reasonChildSafetyCSAMSchema;
type reasonChildSafetyGroom$schematype = typeof _reasonChildSafetyGroomSchema;
type reasonChildSafetyHarassment$schematype = typeof _reasonChildSafetyHarassmentSchema;
type reasonChildSafetyOther$schematype = typeof _reasonChildSafetyOtherSchema;
type reasonChildSafetyPrivacy$schematype = typeof _reasonChildSafetyPrivacySchema;
type reasonHarassmentDoxxing$schematype = typeof _reasonHarassmentDoxxingSchema;
type reasonHarassmentHateSpeech$schematype = typeof _reasonHarassmentHateSpeechSchema;
type reasonHarassmentOther$schematype = typeof _reasonHarassmentOtherSchema;
type reasonHarassmentTargeted$schematype = typeof _reasonHarassmentTargetedSchema;
type reasonHarassmentTroll$schematype = typeof _reasonHarassmentTrollSchema;
type reasonMisleadingBot$schematype = typeof _reasonMisleadingBotSchema;
type reasonMisleadingElections$schematype = typeof _reasonMisleadingElectionsSchema;
type reasonMisleadingImpersonation$schematype = typeof _reasonMisleadingImpersonationSchema;
type reasonMisleadingOther$schematype = typeof _reasonMisleadingOtherSchema;
type reasonMisleadingScam$schematype = typeof _reasonMisleadingScamSchema;
type reasonMisleadingSpam$schematype = typeof _reasonMisleadingSpamSchema;
type reasonOther$schematype = typeof _reasonOtherSchema;
type reasonRuleBanEvasion$schematype = typeof _reasonRuleBanEvasionSchema;
type reasonRuleOther$schematype = typeof _reasonRuleOtherSchema;
type reasonRuleProhibitedSales$schematype = typeof _reasonRuleProhibitedSalesSchema;
type reasonRuleSiteSecurity$schematype = typeof _reasonRuleSiteSecuritySchema;
type reasonSelfHarmContent$schematype = typeof _reasonSelfHarmContentSchema;
type reasonSelfHarmED$schematype = typeof _reasonSelfHarmEDSchema;
type reasonSelfHarmOther$schematype = typeof _reasonSelfHarmOtherSchema;
type reasonSelfHarmStunts$schematype = typeof _reasonSelfHarmStuntsSchema;
type reasonSelfHarmSubstances$schematype = typeof _reasonSelfHarmSubstancesSchema;
type reasonSexualAbuseContent$schematype = typeof _reasonSexualAbuseContentSchema;
type reasonSexualAnimal$schematype = typeof _reasonSexualAnimalSchema;
type reasonSexualDeepfake$schematype = typeof _reasonSexualDeepfakeSchema;
type reasonSexualNCII$schematype = typeof _reasonSexualNCIISchema;
type reasonSexualOther$schematype = typeof _reasonSexualOtherSchema;
type reasonSexualUnlabeled$schematype = typeof _reasonSexualUnlabeledSchema;
type reasonType$schematype = typeof _reasonTypeSchema;
type reasonViolenceAnimal$schematype = typeof _reasonViolenceAnimalSchema;
type reasonViolenceExtremistContent$schematype = typeof _reasonViolenceExtremistContentSchema;
type reasonViolenceGlorification$schematype = typeof _reasonViolenceGlorificationSchema;
type reasonViolenceGraphicContent$schematype = typeof _reasonViolenceGraphicContentSchema;
type reasonViolenceOther$schematype = typeof _reasonViolenceOtherSchema;
type reasonViolenceThreats$schematype = typeof _reasonViolenceThreatsSchema;
type reasonViolenceTrafficking$schematype = typeof _reasonViolenceTraffickingSchema;
type reopenActivity$schematype = typeof _reopenActivitySchema;
type reportActivityView$schematype = typeof _reportActivityViewSchema;
type reportAssignment$schematype = typeof _reportAssignmentSchema;
type reportView$schematype = typeof _reportViewSchema;

export interface assignmentActivitySchema extends assignmentActivity$schematype {}
export interface assignmentViewSchema extends assignmentView$schematype {}
export interface closeActivitySchema extends closeActivity$schematype {}
export interface escalationActivitySchema extends escalationActivity$schematype {}
export interface historicalStatsSchema extends historicalStats$schematype {}
export interface liveStatsSchema extends liveStats$schematype {}
export interface noteActivitySchema extends noteActivity$schematype {}
export interface queueActivitySchema extends queueActivity$schematype {}
export interface reasonAppealSchema extends reasonAppeal$schematype {}
export interface reasonChildSafetyCSAMSchema extends reasonChildSafetyCSAM$schematype {}
export interface reasonChildSafetyGroomSchema extends reasonChildSafetyGroom$schematype {}
export interface reasonChildSafetyHarassmentSchema extends reasonChildSafetyHarassment$schematype {}
export interface reasonChildSafetyOtherSchema extends reasonChildSafetyOther$schematype {}
export interface reasonChildSafetyPrivacySchema extends reasonChildSafetyPrivacy$schematype {}
export interface reasonHarassmentDoxxingSchema extends reasonHarassmentDoxxing$schematype {}
export interface reasonHarassmentHateSpeechSchema extends reasonHarassmentHateSpeech$schematype {}
export interface reasonHarassmentOtherSchema extends reasonHarassmentOther$schematype {}
export interface reasonHarassmentTargetedSchema extends reasonHarassmentTargeted$schematype {}
export interface reasonHarassmentTrollSchema extends reasonHarassmentTroll$schematype {}
export interface reasonMisleadingBotSchema extends reasonMisleadingBot$schematype {}
export interface reasonMisleadingElectionsSchema extends reasonMisleadingElections$schematype {}
export interface reasonMisleadingImpersonationSchema extends reasonMisleadingImpersonation$schematype {}
export interface reasonMisleadingOtherSchema extends reasonMisleadingOther$schematype {}
export interface reasonMisleadingScamSchema extends reasonMisleadingScam$schematype {}
export interface reasonMisleadingSpamSchema extends reasonMisleadingSpam$schematype {}
export interface reasonOtherSchema extends reasonOther$schematype {}
export interface reasonRuleBanEvasionSchema extends reasonRuleBanEvasion$schematype {}
export interface reasonRuleOtherSchema extends reasonRuleOther$schematype {}
export interface reasonRuleProhibitedSalesSchema extends reasonRuleProhibitedSales$schematype {}
export interface reasonRuleSiteSecuritySchema extends reasonRuleSiteSecurity$schematype {}
export interface reasonSelfHarmContentSchema extends reasonSelfHarmContent$schematype {}
export interface reasonSelfHarmEDSchema extends reasonSelfHarmED$schematype {}
export interface reasonSelfHarmOtherSchema extends reasonSelfHarmOther$schematype {}
export interface reasonSelfHarmStuntsSchema extends reasonSelfHarmStunts$schematype {}
export interface reasonSelfHarmSubstancesSchema extends reasonSelfHarmSubstances$schematype {}
export interface reasonSexualAbuseContentSchema extends reasonSexualAbuseContent$schematype {}
export interface reasonSexualAnimalSchema extends reasonSexualAnimal$schematype {}
export interface reasonSexualDeepfakeSchema extends reasonSexualDeepfake$schematype {}
export interface reasonSexualNCIISchema extends reasonSexualNCII$schematype {}
export interface reasonSexualOtherSchema extends reasonSexualOther$schematype {}
export interface reasonSexualUnlabeledSchema extends reasonSexualUnlabeled$schematype {}
export interface reasonTypeSchema extends reasonType$schematype {}
export interface reasonViolenceAnimalSchema extends reasonViolenceAnimal$schematype {}
export interface reasonViolenceExtremistContentSchema extends reasonViolenceExtremistContent$schematype {}
export interface reasonViolenceGlorificationSchema extends reasonViolenceGlorification$schematype {}
export interface reasonViolenceGraphicContentSchema extends reasonViolenceGraphicContent$schematype {}
export interface reasonViolenceOtherSchema extends reasonViolenceOther$schematype {}
export interface reasonViolenceThreatsSchema extends reasonViolenceThreats$schematype {}
export interface reasonViolenceTraffickingSchema extends reasonViolenceTrafficking$schematype {}
export interface reopenActivitySchema extends reopenActivity$schematype {}
export interface reportActivityViewSchema extends reportActivityView$schematype {}
export interface reportAssignmentSchema extends reportAssignment$schematype {}
export interface reportViewSchema extends reportView$schematype {}

export const assignmentActivitySchema = _assignmentActivitySchema as assignmentActivitySchema;
export const assignmentViewSchema = _assignmentViewSchema as assignmentViewSchema;
export const closeActivitySchema = _closeActivitySchema as closeActivitySchema;
export const escalationActivitySchema = _escalationActivitySchema as escalationActivitySchema;
export const historicalStatsSchema = _historicalStatsSchema as historicalStatsSchema;
export const liveStatsSchema = _liveStatsSchema as liveStatsSchema;
export const noteActivitySchema = _noteActivitySchema as noteActivitySchema;
export const queueActivitySchema = _queueActivitySchema as queueActivitySchema;
export const reasonAppealSchema = _reasonAppealSchema as reasonAppealSchema;
export const reasonChildSafetyCSAMSchema = _reasonChildSafetyCSAMSchema as reasonChildSafetyCSAMSchema;
export const reasonChildSafetyGroomSchema = _reasonChildSafetyGroomSchema as reasonChildSafetyGroomSchema;
export const reasonChildSafetyHarassmentSchema =
	_reasonChildSafetyHarassmentSchema as reasonChildSafetyHarassmentSchema;
export const reasonChildSafetyOtherSchema = _reasonChildSafetyOtherSchema as reasonChildSafetyOtherSchema;
export const reasonChildSafetyPrivacySchema =
	_reasonChildSafetyPrivacySchema as reasonChildSafetyPrivacySchema;
export const reasonHarassmentDoxxingSchema = _reasonHarassmentDoxxingSchema as reasonHarassmentDoxxingSchema;
export const reasonHarassmentHateSpeechSchema =
	_reasonHarassmentHateSpeechSchema as reasonHarassmentHateSpeechSchema;
export const reasonHarassmentOtherSchema = _reasonHarassmentOtherSchema as reasonHarassmentOtherSchema;
export const reasonHarassmentTargetedSchema =
	_reasonHarassmentTargetedSchema as reasonHarassmentTargetedSchema;
export const reasonHarassmentTrollSchema = _reasonHarassmentTrollSchema as reasonHarassmentTrollSchema;
export const reasonMisleadingBotSchema = _reasonMisleadingBotSchema as reasonMisleadingBotSchema;
export const reasonMisleadingElectionsSchema =
	_reasonMisleadingElectionsSchema as reasonMisleadingElectionsSchema;
export const reasonMisleadingImpersonationSchema =
	_reasonMisleadingImpersonationSchema as reasonMisleadingImpersonationSchema;
export const reasonMisleadingOtherSchema = _reasonMisleadingOtherSchema as reasonMisleadingOtherSchema;
export const reasonMisleadingScamSchema = _reasonMisleadingScamSchema as reasonMisleadingScamSchema;
export const reasonMisleadingSpamSchema = _reasonMisleadingSpamSchema as reasonMisleadingSpamSchema;
export const reasonOtherSchema = _reasonOtherSchema as reasonOtherSchema;
export const reasonRuleBanEvasionSchema = _reasonRuleBanEvasionSchema as reasonRuleBanEvasionSchema;
export const reasonRuleOtherSchema = _reasonRuleOtherSchema as reasonRuleOtherSchema;
export const reasonRuleProhibitedSalesSchema =
	_reasonRuleProhibitedSalesSchema as reasonRuleProhibitedSalesSchema;
export const reasonRuleSiteSecuritySchema = _reasonRuleSiteSecuritySchema as reasonRuleSiteSecuritySchema;
export const reasonSelfHarmContentSchema = _reasonSelfHarmContentSchema as reasonSelfHarmContentSchema;
export const reasonSelfHarmEDSchema = _reasonSelfHarmEDSchema as reasonSelfHarmEDSchema;
export const reasonSelfHarmOtherSchema = _reasonSelfHarmOtherSchema as reasonSelfHarmOtherSchema;
export const reasonSelfHarmStuntsSchema = _reasonSelfHarmStuntsSchema as reasonSelfHarmStuntsSchema;
export const reasonSelfHarmSubstancesSchema =
	_reasonSelfHarmSubstancesSchema as reasonSelfHarmSubstancesSchema;
export const reasonSexualAbuseContentSchema =
	_reasonSexualAbuseContentSchema as reasonSexualAbuseContentSchema;
export const reasonSexualAnimalSchema = _reasonSexualAnimalSchema as reasonSexualAnimalSchema;
export const reasonSexualDeepfakeSchema = _reasonSexualDeepfakeSchema as reasonSexualDeepfakeSchema;
export const reasonSexualNCIISchema = _reasonSexualNCIISchema as reasonSexualNCIISchema;
export const reasonSexualOtherSchema = _reasonSexualOtherSchema as reasonSexualOtherSchema;
export const reasonSexualUnlabeledSchema = _reasonSexualUnlabeledSchema as reasonSexualUnlabeledSchema;
export const reasonTypeSchema = _reasonTypeSchema as reasonTypeSchema;
export const reasonViolenceAnimalSchema = _reasonViolenceAnimalSchema as reasonViolenceAnimalSchema;
export const reasonViolenceExtremistContentSchema =
	_reasonViolenceExtremistContentSchema as reasonViolenceExtremistContentSchema;
export const reasonViolenceGlorificationSchema =
	_reasonViolenceGlorificationSchema as reasonViolenceGlorificationSchema;
export const reasonViolenceGraphicContentSchema =
	_reasonViolenceGraphicContentSchema as reasonViolenceGraphicContentSchema;
export const reasonViolenceOtherSchema = _reasonViolenceOtherSchema as reasonViolenceOtherSchema;
export const reasonViolenceThreatsSchema = _reasonViolenceThreatsSchema as reasonViolenceThreatsSchema;
export const reasonViolenceTraffickingSchema =
	_reasonViolenceTraffickingSchema as reasonViolenceTraffickingSchema;
export const reopenActivitySchema = _reopenActivitySchema as reopenActivitySchema;
export const reportActivityViewSchema = _reportActivityViewSchema as reportActivityViewSchema;
export const reportAssignmentSchema = _reportAssignmentSchema as reportAssignmentSchema;
export const reportViewSchema = _reportViewSchema as reportViewSchema;

export interface AssignmentActivity extends v.InferInput<typeof assignmentActivitySchema> {}
export interface AssignmentView extends v.InferInput<typeof assignmentViewSchema> {}
export interface CloseActivity extends v.InferInput<typeof closeActivitySchema> {}
export interface EscalationActivity extends v.InferInput<typeof escalationActivitySchema> {}
export interface HistoricalStats extends v.InferInput<typeof historicalStatsSchema> {}
export interface LiveStats extends v.InferInput<typeof liveStatsSchema> {}
export interface NoteActivity extends v.InferInput<typeof noteActivitySchema> {}
export interface QueueActivity extends v.InferInput<typeof queueActivitySchema> {}
export type ReasonAppeal = v.InferInput<typeof reasonAppealSchema>;
export type ReasonChildSafetyCSAM = v.InferInput<typeof reasonChildSafetyCSAMSchema>;
export type ReasonChildSafetyGroom = v.InferInput<typeof reasonChildSafetyGroomSchema>;
export type ReasonChildSafetyHarassment = v.InferInput<typeof reasonChildSafetyHarassmentSchema>;
export type ReasonChildSafetyOther = v.InferInput<typeof reasonChildSafetyOtherSchema>;
export type ReasonChildSafetyPrivacy = v.InferInput<typeof reasonChildSafetyPrivacySchema>;
export type ReasonHarassmentDoxxing = v.InferInput<typeof reasonHarassmentDoxxingSchema>;
export type ReasonHarassmentHateSpeech = v.InferInput<typeof reasonHarassmentHateSpeechSchema>;
export type ReasonHarassmentOther = v.InferInput<typeof reasonHarassmentOtherSchema>;
export type ReasonHarassmentTargeted = v.InferInput<typeof reasonHarassmentTargetedSchema>;
export type ReasonHarassmentTroll = v.InferInput<typeof reasonHarassmentTrollSchema>;
export type ReasonMisleadingBot = v.InferInput<typeof reasonMisleadingBotSchema>;
export type ReasonMisleadingElections = v.InferInput<typeof reasonMisleadingElectionsSchema>;
export type ReasonMisleadingImpersonation = v.InferInput<typeof reasonMisleadingImpersonationSchema>;
export type ReasonMisleadingOther = v.InferInput<typeof reasonMisleadingOtherSchema>;
export type ReasonMisleadingScam = v.InferInput<typeof reasonMisleadingScamSchema>;
export type ReasonMisleadingSpam = v.InferInput<typeof reasonMisleadingSpamSchema>;
export type ReasonOther = v.InferInput<typeof reasonOtherSchema>;
export type ReasonRuleBanEvasion = v.InferInput<typeof reasonRuleBanEvasionSchema>;
export type ReasonRuleOther = v.InferInput<typeof reasonRuleOtherSchema>;
export type ReasonRuleProhibitedSales = v.InferInput<typeof reasonRuleProhibitedSalesSchema>;
export type ReasonRuleSiteSecurity = v.InferInput<typeof reasonRuleSiteSecuritySchema>;
export type ReasonSelfHarmContent = v.InferInput<typeof reasonSelfHarmContentSchema>;
export type ReasonSelfHarmED = v.InferInput<typeof reasonSelfHarmEDSchema>;
export type ReasonSelfHarmOther = v.InferInput<typeof reasonSelfHarmOtherSchema>;
export type ReasonSelfHarmStunts = v.InferInput<typeof reasonSelfHarmStuntsSchema>;
export type ReasonSelfHarmSubstances = v.InferInput<typeof reasonSelfHarmSubstancesSchema>;
export type ReasonSexualAbuseContent = v.InferInput<typeof reasonSexualAbuseContentSchema>;
export type ReasonSexualAnimal = v.InferInput<typeof reasonSexualAnimalSchema>;
export type ReasonSexualDeepfake = v.InferInput<typeof reasonSexualDeepfakeSchema>;
export type ReasonSexualNCII = v.InferInput<typeof reasonSexualNCIISchema>;
export type ReasonSexualOther = v.InferInput<typeof reasonSexualOtherSchema>;
export type ReasonSexualUnlabeled = v.InferInput<typeof reasonSexualUnlabeledSchema>;
export type ReasonType = v.InferInput<typeof reasonTypeSchema>;
export type ReasonViolenceAnimal = v.InferInput<typeof reasonViolenceAnimalSchema>;
export type ReasonViolenceExtremistContent = v.InferInput<typeof reasonViolenceExtremistContentSchema>;
export type ReasonViolenceGlorification = v.InferInput<typeof reasonViolenceGlorificationSchema>;
export type ReasonViolenceGraphicContent = v.InferInput<typeof reasonViolenceGraphicContentSchema>;
export type ReasonViolenceOther = v.InferInput<typeof reasonViolenceOtherSchema>;
export type ReasonViolenceThreats = v.InferInput<typeof reasonViolenceThreatsSchema>;
export type ReasonViolenceTrafficking = v.InferInput<typeof reasonViolenceTraffickingSchema>;
export interface ReopenActivity extends v.InferInput<typeof reopenActivitySchema> {}
export interface ReportActivityView extends v.InferInput<typeof reportActivityViewSchema> {}
export interface ReportAssignment extends v.InferInput<typeof reportAssignmentSchema> {}
export interface ReportView extends v.InferInput<typeof reportViewSchema> {}
