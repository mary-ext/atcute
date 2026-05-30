import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoModerationDefs from '@atcute/atproto/types/moderation/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import * as ComAtprotoServerDefs from '@atcute/atproto/types/server/defs';
import * as AppBskyAgeassuranceDefs from '@atcute/bluesky/types/app/ageassurance/defs';
import * as ChatBskyConvoDefs from '@atcute/bluesky/types/chat/convo/defs';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _accountEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#accountEvent')),
	/** Indicates that the account has a repository which can be fetched from the host that emitted this event. */
	active: /*#__PURE__*/ v.boolean(),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	status: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			'deactivated' | 'deleted' | 'suspended' | 'takendown' | 'tombstoned' | 'unknown' | (string & {})
		>(),
	),
	timestamp: /*#__PURE__*/ v.datetimeString(),
});
const _accountHostingSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#accountHosting')),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	deactivatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	deletedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	reactivatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	status: /*#__PURE__*/ v.string<
		'deactivated' | 'deleted' | 'suspended' | 'takendown' | 'unknown' | (string & {})
	>(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _accountStatsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#accountStats')),
	/** Total number of appeals against a moderation action on the account */
	appealCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of times the account was escalated */
	escalateCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Total number of reports on the account */
	reportCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of times the account was suspended */
	suspendCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of times the account was taken down */
	takedownCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _accountStrikeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#accountStrike')),
	/** Current number of active strikes (excluding expired strikes) */
	activeStrikeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Timestamp of the first strike received */
	firstStrikeAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Timestamp of the most recent strike received */
	lastStrikeAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Total number of strikes ever received (including expired strikes) */
	totalStrikeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _ageAssuranceEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#ageAssuranceEvent')),
	get access() {
		return /*#__PURE__*/ v.optional(AppBskyAgeassuranceDefs.accessSchema);
	},
	/** The unique identifier for this instance of the age assurance flow, in UUID format. */
	attemptId: /*#__PURE__*/ v.string(),
	/** The IP address used when completing the AA flow. */
	completeIp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The user agent used when completing the AA flow. */
	completeUa: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The ISO 3166-1 alpha-2 country code provided when beginning the Age Assurance flow. */
	countryCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The date and time of this write operation. */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** The IP address used when initiating the AA flow. */
	initIp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The user agent used when initiating the AA flow. */
	initUa: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The ISO 3166-2 region code provided when beginning the Age Assurance flow. */
	regionCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The status of the Age Assurance process. */
	status: /*#__PURE__*/ v.string<'assured' | 'pending' | 'unknown' | (string & {})>(),
});
const _ageAssuranceOverrideEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#ageAssuranceOverrideEvent'),
	),
	get access() {
		return /*#__PURE__*/ v.optional(AppBskyAgeassuranceDefs.accessSchema);
	},
	/**
	 * Comment describing the reason for the override.
	 *
	 * @minLength 1
	 */
	comment: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1)]),
	/**
	 * The status to be set for the user decided by a moderator, overriding whatever value the user had
	 * previously. Use reset to default to original state.
	 */
	status: /*#__PURE__*/ v.string<'assured' | 'blocked' | 'reset' | (string & {})>(),
});
const _ageAssurancePurgeEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#ageAssurancePurgeEvent'),
	),
	/**
	 * Comment describing the reason for the purge.
	 *
	 * @minLength 1
	 */
	comment: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1)]),
});
const _blobViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#blobView')),
	cid: /*#__PURE__*/ v.cidString(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get details() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([imageDetailsSchema, videoDetailsSchema]));
	},
	mimeType: /*#__PURE__*/ v.string(),
	get moderation() {
		return /*#__PURE__*/ v.optional(moderationSchema);
	},
	size: /*#__PURE__*/ v.integer(),
});
const _cancelScheduledTakedownEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#cancelScheduledTakedownEvent'),
	),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _convoViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#convoView')),
	convoId: /*#__PURE__*/ v.string(),
	did: /*#__PURE__*/ v.didString(),
});
const _identityEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#identityEvent')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	handle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.handleString()),
	pdsHost: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	timestamp: /*#__PURE__*/ v.datetimeString(),
	tombstone: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _imageDetailsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#imageDetails')),
	height: /*#__PURE__*/ v.integer(),
	width: /*#__PURE__*/ v.integer(),
});
const _modEventAcknowledgeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventAcknowledge')),
	/** If true, all other reports on content authored by this account will be resolved (acknowledged). */
	acknowledgeAccountSubjects: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventCommentSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventComment')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Make the comment persistent on the subject */
	sticky: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _modEventDivertSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventDivert')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventEmailSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventEmail')),
	/** Additional comment about the outgoing comm. */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The content of the email sent to the user. */
	content: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Indicates whether the email was successfully delivered to the user's inbox. */
	isDelivered: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * Names/Keywords of the policies that necessitated the email.
	 *
	 * @maxLength 5
	 */
	policies: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
			/*#__PURE__*/ v.arrayLength(0, 5),
		]),
	),
	/** Severity level of the violation. Normally 'sev-1' that adds strike on repeat offense */
	severityLevel: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Number of strikes to assign to the user for this violation. Normally 0 as an indicator of a warning and
	 * only added as a strike on a repeat offense.
	 */
	strikeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** When the strike should expire. If not provided, the strike never expires. */
	strikeExpiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** The subject line of the email sent to the user. */
	subjectLine: /*#__PURE__*/ v.string(),
});
const _modEventEscalateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventEscalate')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventLabelSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventLabel')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	createLabelVals: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
	/** Indicates how long the label will remain on the subject. Only applies on labels that are being added. */
	durationInHours: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	negateLabelVals: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});
const _modEventMuteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventMute')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Indicates how long the subject should remain muted. */
	durationInHours: /*#__PURE__*/ v.integer(),
});
const _modEventMuteReporterSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventMuteReporter'),
	),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Indicates how long the account should remain muted. Falsy value here means a permanent mute. */
	durationInHours: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _modEventPriorityScoreSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventPriorityScore'),
	),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * @minimum 0
	 * @maximum 100
	 */
	score: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
});
const _modEventReportSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventReport')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Set to true if the reporter was muted from reporting at the time of the event. These reports won't impact
	 * the reviewState of the subject.
	 */
	isReporterMuted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get reportType() {
		return ComAtprotoModerationDefs.reasonTypeSchema;
	},
});
const _modEventResolveAppealSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventResolveAppeal'),
	),
	/** Describe resolution. */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventReverseTakedownSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventReverseTakedown'),
	),
	/** Describe reasoning behind the reversal. */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Names/Keywords of the policy infraction for which takedown is being reversed.
	 *
	 * @maxLength 5
	 */
	policies: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
			/*#__PURE__*/ v.arrayLength(0, 5),
		]),
	),
	/** Severity level of the violation. Usually set from the last policy infraction's severity. */
	severityLevel: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Number of strikes to subtract from the user's strike count. Usually set from the last policy infraction's
	 * severity.
	 */
	strikeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _modEventTagSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventTag')),
	/** Tags to be added to the subject. If already exists, won't be duplicated. */
	add: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
	/** Additional comment about added/removed tags. */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Indicates how long the tags being added should remain before automatically being removed. Only applies to
	 * tags being added.
	 */
	durationInHours: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Tags to be removed to the subject. Ignores a tag If it doesn't exist, won't be duplicated. */
	remove: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});
const _modEventTakedownSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventTakedown')),
	/** If true, all other reports on content authored by this account will be resolved (acknowledged). */
	acknowledgeAccountSubjects: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Indicates how long the takedown should be in effect before automatically expiring. */
	durationInHours: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * Names/Keywords of the policies that drove the decision.
	 *
	 * @maxLength 5
	 */
	policies: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
			/*#__PURE__*/ v.arrayLength(0, 5),
		]),
	),
	/** Severity level of the violation (e.g., 'sev-0', 'sev-1', 'sev-2', etc.). */
	severityLevel: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Number of strikes to assign to the user for this violation. */
	strikeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** When the strike should expire. If not provided, the strike never expires. */
	strikeExpiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * List of services where the takedown should be applied. If empty or not provided, takedown is applied on
	 * all configured services.
	 */
	targetServices: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'appview' | 'pds' | (string & {})>()),
	),
});
const _modEventUnmuteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventUnmute')),
	/** Describe reasoning behind the reversal. */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventUnmuteReporterSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventUnmuteReporter'),
	),
	/** Describe reasoning behind the reversal. */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventView')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	createdBy: /*#__PURE__*/ v.didString(),
	creatorHandle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get event() {
		return /*#__PURE__*/ v.variant([
			accountEventSchema,
			ageAssuranceEventSchema,
			ageAssuranceOverrideEventSchema,
			ageAssurancePurgeEventSchema,
			cancelScheduledTakedownEventSchema,
			identityEventSchema,
			modEventAcknowledgeSchema,
			modEventCommentSchema,
			modEventDivertSchema,
			modEventEmailSchema,
			modEventEscalateSchema,
			modEventLabelSchema,
			modEventMuteSchema,
			modEventMuteReporterSchema,
			modEventPriorityScoreSchema,
			modEventReportSchema,
			modEventResolveAppealSchema,
			modEventReverseTakedownSchema,
			modEventTagSchema,
			modEventTakedownSchema,
			modEventUnmuteSchema,
			modEventUnmuteReporterSchema,
			recordEventSchema,
			revokeAccountCredentialsEventSchema,
			scheduleTakedownEventSchema,
		]);
	},
	id: /*#__PURE__*/ v.integer(),
	get modTool() {
		return /*#__PURE__*/ v.optional(modToolSchema);
	},
	get subject() {
		return /*#__PURE__*/ v.variant([
			ChatBskyConvoDefs.convoRefSchema,
			ChatBskyConvoDefs.messageRefSchema,
			ComAtprotoAdminDefs.repoRefSchema,
			ComAtprotoRepoStrongRef.mainSchema,
		]);
	},
	subjectBlobCids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
	subjectHandle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventViewDetailSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventViewDetail')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	createdBy: /*#__PURE__*/ v.didString(),
	get event() {
		return /*#__PURE__*/ v.variant([
			accountEventSchema,
			ageAssuranceEventSchema,
			ageAssuranceOverrideEventSchema,
			ageAssurancePurgeEventSchema,
			cancelScheduledTakedownEventSchema,
			identityEventSchema,
			modEventAcknowledgeSchema,
			modEventCommentSchema,
			modEventDivertSchema,
			modEventEmailSchema,
			modEventEscalateSchema,
			modEventLabelSchema,
			modEventMuteSchema,
			modEventMuteReporterSchema,
			modEventPriorityScoreSchema,
			modEventReportSchema,
			modEventResolveAppealSchema,
			modEventReverseTakedownSchema,
			modEventTagSchema,
			modEventTakedownSchema,
			modEventUnmuteSchema,
			modEventUnmuteReporterSchema,
			recordEventSchema,
			revokeAccountCredentialsEventSchema,
			scheduleTakedownEventSchema,
		]);
	},
	id: /*#__PURE__*/ v.integer(),
	get modTool() {
		return /*#__PURE__*/ v.optional(modToolSchema);
	},
	get subject() {
		return /*#__PURE__*/ v.variant([
			convoViewSchema,
			recordViewSchema,
			recordViewNotFoundSchema,
			repoViewSchema,
			repoViewNotFoundSchema,
		]);
	},
	get subjectBlobs() {
		return /*#__PURE__*/ v.array(blobViewSchema);
	},
});
const _modToolSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modTool')),
	/** Additional arbitrary metadata about the source */
	meta: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
	/** Name/identifier of the source (e.g., 'automod', 'ozone/workspace') */
	name: /*#__PURE__*/ v.string(),
});
const _moderationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#moderation')),
	get subjectStatus() {
		return /*#__PURE__*/ v.optional(subjectStatusViewSchema);
	},
});
const _moderationDetailSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#moderationDetail')),
	get subjectStatus() {
		return /*#__PURE__*/ v.optional(subjectStatusViewSchema);
	},
});
const _recordEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#recordEvent')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	op: /*#__PURE__*/ v.string<'create' | 'delete' | 'update' | (string & {})>(),
	timestamp: /*#__PURE__*/ v.datetimeString(),
});
const _recordHostingSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#recordHosting')),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	deletedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	status: /*#__PURE__*/ v.string<'deleted' | 'unknown' | (string & {})>(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _recordViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#recordView')),
	blobCids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.cidString()),
	cid: /*#__PURE__*/ v.cidString(),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get moderation() {
		return moderationSchema;
	},
	get repo() {
		return repoViewSchema;
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
	value: /*#__PURE__*/ v.unknown(),
});
const _recordViewDetailSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#recordViewDetail')),
	get blobs() {
		return /*#__PURE__*/ v.array(blobViewSchema);
	},
	cid: /*#__PURE__*/ v.cidString(),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	get moderation() {
		return moderationDetailSchema;
	},
	get repo() {
		return repoViewSchema;
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
	value: /*#__PURE__*/ v.unknown(),
});
const _recordViewNotFoundSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#recordViewNotFound')),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _recordsStatsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#recordsStats')),
	/** Number of items that were appealed at least once */
	appealedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of items that were escalated at least once */
	escalatedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of item currently in "reviewOpen" or "reviewEscalated" state */
	pendingCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of item currently in "reviewNone" or "reviewClosed" state */
	processedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of items that were reported at least once */
	reportedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Total number of item in the set */
	subjectCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Number of item currently taken down */
	takendownCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Cumulative sum of the number of reports on the items in the set */
	totalReports: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _repoViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#repoView')),
	deactivatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	did: /*#__PURE__*/ v.didString(),
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	handle: /*#__PURE__*/ v.handleString(),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	inviteNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get invitedBy() {
		return /*#__PURE__*/ v.optional(ComAtprotoServerDefs.inviteCodeSchema);
	},
	invitesDisabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get moderation() {
		return moderationSchema;
	},
	relatedRecords: /*#__PURE__*/ v.array(/*#__PURE__*/ v.unknown()),
	get threatSignatures() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoAdminDefs.threatSignatureSchema));
	},
});
const _repoViewDetailSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#repoViewDetail')),
	deactivatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	did: /*#__PURE__*/ v.didString(),
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	emailConfirmedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	handle: /*#__PURE__*/ v.handleString(),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	inviteNote: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get invitedBy() {
		return /*#__PURE__*/ v.optional(ComAtprotoServerDefs.inviteCodeSchema);
	},
	get invites() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoServerDefs.inviteCodeSchema));
	},
	invitesDisabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	get moderation() {
		return moderationDetailSchema;
	},
	relatedRecords: /*#__PURE__*/ v.array(/*#__PURE__*/ v.unknown()),
	get threatSignatures() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoAdminDefs.threatSignatureSchema));
	},
});
const _repoViewNotFoundSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#repoViewNotFound')),
	did: /*#__PURE__*/ v.didString(),
});
const _reporterStatsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#reporterStats')),
	/** The total number of reports made by the user on accounts. */
	accountReportCount: /*#__PURE__*/ v.integer(),
	did: /*#__PURE__*/ v.didString(),
	/** The total number of accounts labeled as a result of the user's reports. */
	labeledAccountCount: /*#__PURE__*/ v.integer(),
	/** The total number of records labeled as a result of the user's reports. */
	labeledRecordCount: /*#__PURE__*/ v.integer(),
	/** The total number of reports made by the user on records. */
	recordReportCount: /*#__PURE__*/ v.integer(),
	/** The total number of accounts reported by the user. */
	reportedAccountCount: /*#__PURE__*/ v.integer(),
	/** The total number of records reported by the user. */
	reportedRecordCount: /*#__PURE__*/ v.integer(),
	/** The total number of accounts taken down as a result of the user's reports. */
	takendownAccountCount: /*#__PURE__*/ v.integer(),
	/** The total number of records taken down as a result of the user's reports. */
	takendownRecordCount: /*#__PURE__*/ v.integer(),
});
const _reviewClosedSchema = /*#__PURE__*/ v.literal('tools.ozone.moderation.defs#reviewClosed');
const _reviewEscalatedSchema = /*#__PURE__*/ v.literal('tools.ozone.moderation.defs#reviewEscalated');
const _reviewNoneSchema = /*#__PURE__*/ v.literal('tools.ozone.moderation.defs#reviewNone');
const _reviewOpenSchema = /*#__PURE__*/ v.literal('tools.ozone.moderation.defs#reviewOpen');
const _revokeAccountCredentialsEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#revokeAccountCredentialsEvent'),
	),
	/**
	 * Comment describing the reason for the revocation.
	 *
	 * @minLength 1
	 */
	comment: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1)]),
});
const _scheduleTakedownEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#scheduleTakedownEvent'),
	),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	executeAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	executeAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	executeUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _scheduledActionViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#scheduledActionView')),
	/** Type of action to be executed */
	action: /*#__PURE__*/ v.string<'takedown' | (string & {})>(),
	/** When the scheduled action was created */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** DID of the user who created this scheduled action */
	createdBy: /*#__PURE__*/ v.didString(),
	/** Subject DID for the action */
	did: /*#__PURE__*/ v.didString(),
	/** Serialized event object that will be propagated to the event when performed */
	eventData: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
	/** Earliest time to execute the action (for randomized scheduling) */
	executeAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Exact time to execute the action */
	executeAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Latest time to execute the action (for randomized scheduling) */
	executeUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** ID of the moderation event created when action was successfully executed */
	executionEventId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** Auto-incrementing row ID */
	id: /*#__PURE__*/ v.integer(),
	/** When the action was last attempted to be executed */
	lastExecutedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Reason for the last execution failure */
	lastFailureReason: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Whether execution time should be randomized within the specified range */
	randomizeExecution: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/** Current status of the scheduled action */
	status: /*#__PURE__*/ v.string<'cancelled' | 'executed' | 'failed' | 'pending' | (string & {})>(),
	/** When the scheduled action was last updated */
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _subjectReviewStateSchema = /*#__PURE__*/ v.string<
	| 'tools.ozone.moderation.defs#reviewClosed'
	| 'tools.ozone.moderation.defs#reviewEscalated'
	| 'tools.ozone.moderation.defs#reviewNone'
	| 'tools.ozone.moderation.defs#reviewOpen'
	| (string & {})
>();
const _subjectStatusViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#subjectStatusView')),
	/** Statistics related to the account subject */
	get accountStats() {
		return /*#__PURE__*/ v.optional(accountStatsSchema);
	},
	/** Strike information for the account (account-level only) */
	get accountStrike() {
		return /*#__PURE__*/ v.optional(accountStrikeSchema);
	},
	/** Current age assurance state of the subject. */
	ageAssuranceState: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'assured' | 'blocked' | 'pending' | 'reset' | 'unknown' | (string & {})>(),
	),
	/** Whether or not the last successful update to age assurance was made by the user or admin. */
	ageAssuranceUpdatedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'admin' | 'user' | (string & {})>()),
	/**
	 * True indicates that the a previously taken moderator action was appealed against, by the author of the
	 * content. False indicates last appeal was resolved by moderators.
	 */
	appealed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/** Sticky comment on the subject. */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Timestamp referencing the first moderation status impacting event was emitted on the subject */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get hosting() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([accountHostingSchema, recordHostingSchema]));
	},
	id: /*#__PURE__*/ v.integer(),
	/** Timestamp referencing when the author of the subject appealed a moderation action */
	lastAppealedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	lastReportedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	lastReviewedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	lastReviewedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	muteReportingUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	muteUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * Numeric value representing the level of priority. Higher score means higher priority.
	 *
	 * @minimum 0
	 * @maximum 100
	 */
	priorityScore: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
	),
	/** Statistics related to the record subjects authored by the subject's account */
	get recordsStats() {
		return /*#__PURE__*/ v.optional(recordsStatsSchema);
	},
	get reviewState() {
		return subjectReviewStateSchema;
	},
	get subject() {
		return /*#__PURE__*/ v.variant([
			ChatBskyConvoDefs.convoRefSchema,
			ChatBskyConvoDefs.messageRefSchema,
			ComAtprotoAdminDefs.repoRefSchema,
			ComAtprotoRepoStrongRef.mainSchema,
		]);
	},
	subjectBlobCids: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.cidString())),
	subjectRepoHandle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	suspendUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	tags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	takendown: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/** Timestamp referencing when the last update was made to the moderation status of the subject */
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});
const _subjectViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#subjectView')),
	get profile() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([]));
	},
	get record() {
		return /*#__PURE__*/ v.optional(recordViewDetailSchema);
	},
	get repo() {
		return /*#__PURE__*/ v.optional(repoViewDetailSchema);
	},
	get status() {
		return /*#__PURE__*/ v.optional(subjectStatusViewSchema);
	},
	subject: /*#__PURE__*/ v.string(),
	get type() {
		return ComAtprotoModerationDefs.subjectTypeSchema;
	},
});
const _timelineEventPlcCreateSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.moderation.defs#timelineEventPlcCreate',
);
const _timelineEventPlcOperationSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.moderation.defs#timelineEventPlcOperation',
);
const _timelineEventPlcTombstoneSchema = /*#__PURE__*/ v.literal(
	'tools.ozone.moderation.defs#timelineEventPlcTombstone',
);
const _videoDetailsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#videoDetails')),
	height: /*#__PURE__*/ v.integer(),
	length: /*#__PURE__*/ v.integer(),
	width: /*#__PURE__*/ v.integer(),
});

type accountEvent$schematype = typeof _accountEventSchema;
type accountHosting$schematype = typeof _accountHostingSchema;
type accountStats$schematype = typeof _accountStatsSchema;
type accountStrike$schematype = typeof _accountStrikeSchema;
type ageAssuranceEvent$schematype = typeof _ageAssuranceEventSchema;
type ageAssuranceOverrideEvent$schematype = typeof _ageAssuranceOverrideEventSchema;
type ageAssurancePurgeEvent$schematype = typeof _ageAssurancePurgeEventSchema;
type blobView$schematype = typeof _blobViewSchema;
type cancelScheduledTakedownEvent$schematype = typeof _cancelScheduledTakedownEventSchema;
type convoView$schematype = typeof _convoViewSchema;
type identityEvent$schematype = typeof _identityEventSchema;
type imageDetails$schematype = typeof _imageDetailsSchema;
type modEventAcknowledge$schematype = typeof _modEventAcknowledgeSchema;
type modEventComment$schematype = typeof _modEventCommentSchema;
type modEventDivert$schematype = typeof _modEventDivertSchema;
type modEventEmail$schematype = typeof _modEventEmailSchema;
type modEventEscalate$schematype = typeof _modEventEscalateSchema;
type modEventLabel$schematype = typeof _modEventLabelSchema;
type modEventMute$schematype = typeof _modEventMuteSchema;
type modEventMuteReporter$schematype = typeof _modEventMuteReporterSchema;
type modEventPriorityScore$schematype = typeof _modEventPriorityScoreSchema;
type modEventReport$schematype = typeof _modEventReportSchema;
type modEventResolveAppeal$schematype = typeof _modEventResolveAppealSchema;
type modEventReverseTakedown$schematype = typeof _modEventReverseTakedownSchema;
type modEventTag$schematype = typeof _modEventTagSchema;
type modEventTakedown$schematype = typeof _modEventTakedownSchema;
type modEventUnmute$schematype = typeof _modEventUnmuteSchema;
type modEventUnmuteReporter$schematype = typeof _modEventUnmuteReporterSchema;
type modEventView$schematype = typeof _modEventViewSchema;
type modEventViewDetail$schematype = typeof _modEventViewDetailSchema;
type modTool$schematype = typeof _modToolSchema;
type moderation$schematype = typeof _moderationSchema;
type moderationDetail$schematype = typeof _moderationDetailSchema;
type recordEvent$schematype = typeof _recordEventSchema;
type recordHosting$schematype = typeof _recordHostingSchema;
type recordView$schematype = typeof _recordViewSchema;
type recordViewDetail$schematype = typeof _recordViewDetailSchema;
type recordViewNotFound$schematype = typeof _recordViewNotFoundSchema;
type recordsStats$schematype = typeof _recordsStatsSchema;
type repoView$schematype = typeof _repoViewSchema;
type repoViewDetail$schematype = typeof _repoViewDetailSchema;
type repoViewNotFound$schematype = typeof _repoViewNotFoundSchema;
type reporterStats$schematype = typeof _reporterStatsSchema;
type reviewClosed$schematype = typeof _reviewClosedSchema;
type reviewEscalated$schematype = typeof _reviewEscalatedSchema;
type reviewNone$schematype = typeof _reviewNoneSchema;
type reviewOpen$schematype = typeof _reviewOpenSchema;
type revokeAccountCredentialsEvent$schematype = typeof _revokeAccountCredentialsEventSchema;
type scheduleTakedownEvent$schematype = typeof _scheduleTakedownEventSchema;
type scheduledActionView$schematype = typeof _scheduledActionViewSchema;
type subjectReviewState$schematype = typeof _subjectReviewStateSchema;
type subjectStatusView$schematype = typeof _subjectStatusViewSchema;
type subjectView$schematype = typeof _subjectViewSchema;
type timelineEventPlcCreate$schematype = typeof _timelineEventPlcCreateSchema;
type timelineEventPlcOperation$schematype = typeof _timelineEventPlcOperationSchema;
type timelineEventPlcTombstone$schematype = typeof _timelineEventPlcTombstoneSchema;
type videoDetails$schematype = typeof _videoDetailsSchema;

export interface accountEventSchema extends accountEvent$schematype {}
export interface accountHostingSchema extends accountHosting$schematype {}
export interface accountStatsSchema extends accountStats$schematype {}
export interface accountStrikeSchema extends accountStrike$schematype {}
export interface ageAssuranceEventSchema extends ageAssuranceEvent$schematype {}
export interface ageAssuranceOverrideEventSchema extends ageAssuranceOverrideEvent$schematype {}
export interface ageAssurancePurgeEventSchema extends ageAssurancePurgeEvent$schematype {}
export interface blobViewSchema extends blobView$schematype {}
export interface cancelScheduledTakedownEventSchema extends cancelScheduledTakedownEvent$schematype {}
export interface convoViewSchema extends convoView$schematype {}
export interface identityEventSchema extends identityEvent$schematype {}
export interface imageDetailsSchema extends imageDetails$schematype {}
export interface modEventAcknowledgeSchema extends modEventAcknowledge$schematype {}
export interface modEventCommentSchema extends modEventComment$schematype {}
export interface modEventDivertSchema extends modEventDivert$schematype {}
export interface modEventEmailSchema extends modEventEmail$schematype {}
export interface modEventEscalateSchema extends modEventEscalate$schematype {}
export interface modEventLabelSchema extends modEventLabel$schematype {}
export interface modEventMuteSchema extends modEventMute$schematype {}
export interface modEventMuteReporterSchema extends modEventMuteReporter$schematype {}
export interface modEventPriorityScoreSchema extends modEventPriorityScore$schematype {}
export interface modEventReportSchema extends modEventReport$schematype {}
export interface modEventResolveAppealSchema extends modEventResolveAppeal$schematype {}
export interface modEventReverseTakedownSchema extends modEventReverseTakedown$schematype {}
export interface modEventTagSchema extends modEventTag$schematype {}
export interface modEventTakedownSchema extends modEventTakedown$schematype {}
export interface modEventUnmuteSchema extends modEventUnmute$schematype {}
export interface modEventUnmuteReporterSchema extends modEventUnmuteReporter$schematype {}
export interface modEventViewSchema extends modEventView$schematype {}
export interface modEventViewDetailSchema extends modEventViewDetail$schematype {}
export interface modToolSchema extends modTool$schematype {}
export interface moderationSchema extends moderation$schematype {}
export interface moderationDetailSchema extends moderationDetail$schematype {}
export interface recordEventSchema extends recordEvent$schematype {}
export interface recordHostingSchema extends recordHosting$schematype {}
export interface recordViewSchema extends recordView$schematype {}
export interface recordViewDetailSchema extends recordViewDetail$schematype {}
export interface recordViewNotFoundSchema extends recordViewNotFound$schematype {}
export interface recordsStatsSchema extends recordsStats$schematype {}
export interface repoViewSchema extends repoView$schematype {}
export interface repoViewDetailSchema extends repoViewDetail$schematype {}
export interface repoViewNotFoundSchema extends repoViewNotFound$schematype {}
export interface reporterStatsSchema extends reporterStats$schematype {}
export interface reviewClosedSchema extends reviewClosed$schematype {}
export interface reviewEscalatedSchema extends reviewEscalated$schematype {}
export interface reviewNoneSchema extends reviewNone$schematype {}
export interface reviewOpenSchema extends reviewOpen$schematype {}
export interface revokeAccountCredentialsEventSchema extends revokeAccountCredentialsEvent$schematype {}
export interface scheduleTakedownEventSchema extends scheduleTakedownEvent$schematype {}
export interface scheduledActionViewSchema extends scheduledActionView$schematype {}
export interface subjectReviewStateSchema extends subjectReviewState$schematype {}
export interface subjectStatusViewSchema extends subjectStatusView$schematype {}
export interface subjectViewSchema extends subjectView$schematype {}
export interface timelineEventPlcCreateSchema extends timelineEventPlcCreate$schematype {}
export interface timelineEventPlcOperationSchema extends timelineEventPlcOperation$schematype {}
export interface timelineEventPlcTombstoneSchema extends timelineEventPlcTombstone$schematype {}
export interface videoDetailsSchema extends videoDetails$schematype {}

export const accountEventSchema = _accountEventSchema as accountEventSchema;
export const accountHostingSchema = _accountHostingSchema as accountHostingSchema;
export const accountStatsSchema = _accountStatsSchema as accountStatsSchema;
export const accountStrikeSchema = _accountStrikeSchema as accountStrikeSchema;
export const ageAssuranceEventSchema = _ageAssuranceEventSchema as ageAssuranceEventSchema;
export const ageAssuranceOverrideEventSchema =
	_ageAssuranceOverrideEventSchema as ageAssuranceOverrideEventSchema;
export const ageAssurancePurgeEventSchema = _ageAssurancePurgeEventSchema as ageAssurancePurgeEventSchema;
export const blobViewSchema = _blobViewSchema as blobViewSchema;
export const cancelScheduledTakedownEventSchema =
	_cancelScheduledTakedownEventSchema as cancelScheduledTakedownEventSchema;
export const convoViewSchema = _convoViewSchema as convoViewSchema;
export const identityEventSchema = _identityEventSchema as identityEventSchema;
export const imageDetailsSchema = _imageDetailsSchema as imageDetailsSchema;
export const modEventAcknowledgeSchema = _modEventAcknowledgeSchema as modEventAcknowledgeSchema;
export const modEventCommentSchema = _modEventCommentSchema as modEventCommentSchema;
export const modEventDivertSchema = _modEventDivertSchema as modEventDivertSchema;
export const modEventEmailSchema = _modEventEmailSchema as modEventEmailSchema;
export const modEventEscalateSchema = _modEventEscalateSchema as modEventEscalateSchema;
export const modEventLabelSchema = _modEventLabelSchema as modEventLabelSchema;
export const modEventMuteSchema = _modEventMuteSchema as modEventMuteSchema;
export const modEventMuteReporterSchema = _modEventMuteReporterSchema as modEventMuteReporterSchema;
export const modEventPriorityScoreSchema = _modEventPriorityScoreSchema as modEventPriorityScoreSchema;
export const modEventReportSchema = _modEventReportSchema as modEventReportSchema;
export const modEventResolveAppealSchema = _modEventResolveAppealSchema as modEventResolveAppealSchema;
export const modEventReverseTakedownSchema = _modEventReverseTakedownSchema as modEventReverseTakedownSchema;
export const modEventTagSchema = _modEventTagSchema as modEventTagSchema;
export const modEventTakedownSchema = _modEventTakedownSchema as modEventTakedownSchema;
export const modEventUnmuteSchema = _modEventUnmuteSchema as modEventUnmuteSchema;
export const modEventUnmuteReporterSchema = _modEventUnmuteReporterSchema as modEventUnmuteReporterSchema;
export const modEventViewSchema = _modEventViewSchema as modEventViewSchema;
export const modEventViewDetailSchema = _modEventViewDetailSchema as modEventViewDetailSchema;
export const modToolSchema = _modToolSchema as modToolSchema;
export const moderationSchema = _moderationSchema as moderationSchema;
export const moderationDetailSchema = _moderationDetailSchema as moderationDetailSchema;
export const recordEventSchema = _recordEventSchema as recordEventSchema;
export const recordHostingSchema = _recordHostingSchema as recordHostingSchema;
export const recordViewSchema = _recordViewSchema as recordViewSchema;
export const recordViewDetailSchema = _recordViewDetailSchema as recordViewDetailSchema;
export const recordViewNotFoundSchema = _recordViewNotFoundSchema as recordViewNotFoundSchema;
export const recordsStatsSchema = _recordsStatsSchema as recordsStatsSchema;
export const repoViewSchema = _repoViewSchema as repoViewSchema;
export const repoViewDetailSchema = _repoViewDetailSchema as repoViewDetailSchema;
export const repoViewNotFoundSchema = _repoViewNotFoundSchema as repoViewNotFoundSchema;
export const reporterStatsSchema = _reporterStatsSchema as reporterStatsSchema;
export const reviewClosedSchema = _reviewClosedSchema as reviewClosedSchema;
export const reviewEscalatedSchema = _reviewEscalatedSchema as reviewEscalatedSchema;
export const reviewNoneSchema = _reviewNoneSchema as reviewNoneSchema;
export const reviewOpenSchema = _reviewOpenSchema as reviewOpenSchema;
export const revokeAccountCredentialsEventSchema =
	_revokeAccountCredentialsEventSchema as revokeAccountCredentialsEventSchema;
export const scheduleTakedownEventSchema = _scheduleTakedownEventSchema as scheduleTakedownEventSchema;
export const scheduledActionViewSchema = _scheduledActionViewSchema as scheduledActionViewSchema;
export const subjectReviewStateSchema = _subjectReviewStateSchema as subjectReviewStateSchema;
export const subjectStatusViewSchema = _subjectStatusViewSchema as subjectStatusViewSchema;
export const subjectViewSchema = _subjectViewSchema as subjectViewSchema;
export const timelineEventPlcCreateSchema = _timelineEventPlcCreateSchema as timelineEventPlcCreateSchema;
export const timelineEventPlcOperationSchema =
	_timelineEventPlcOperationSchema as timelineEventPlcOperationSchema;
export const timelineEventPlcTombstoneSchema =
	_timelineEventPlcTombstoneSchema as timelineEventPlcTombstoneSchema;
export const videoDetailsSchema = _videoDetailsSchema as videoDetailsSchema;

export interface AccountEvent extends v.InferInput<typeof accountEventSchema> {}
export interface AccountHosting extends v.InferInput<typeof accountHostingSchema> {}
export interface AccountStats extends v.InferInput<typeof accountStatsSchema> {}
export interface AccountStrike extends v.InferInput<typeof accountStrikeSchema> {}
export interface AgeAssuranceEvent extends v.InferInput<typeof ageAssuranceEventSchema> {}
export interface AgeAssuranceOverrideEvent extends v.InferInput<typeof ageAssuranceOverrideEventSchema> {}
export interface AgeAssurancePurgeEvent extends v.InferInput<typeof ageAssurancePurgeEventSchema> {}
export interface BlobView extends v.InferInput<typeof blobViewSchema> {}
export interface CancelScheduledTakedownEvent extends v.InferInput<
	typeof cancelScheduledTakedownEventSchema
> {}
export interface ConvoView extends v.InferInput<typeof convoViewSchema> {}
export interface IdentityEvent extends v.InferInput<typeof identityEventSchema> {}
export interface ImageDetails extends v.InferInput<typeof imageDetailsSchema> {}
export interface ModEventAcknowledge extends v.InferInput<typeof modEventAcknowledgeSchema> {}
export interface ModEventComment extends v.InferInput<typeof modEventCommentSchema> {}
export interface ModEventDivert extends v.InferInput<typeof modEventDivertSchema> {}
export interface ModEventEmail extends v.InferInput<typeof modEventEmailSchema> {}
export interface ModEventEscalate extends v.InferInput<typeof modEventEscalateSchema> {}
export interface ModEventLabel extends v.InferInput<typeof modEventLabelSchema> {}
export interface ModEventMute extends v.InferInput<typeof modEventMuteSchema> {}
export interface ModEventMuteReporter extends v.InferInput<typeof modEventMuteReporterSchema> {}
export interface ModEventPriorityScore extends v.InferInput<typeof modEventPriorityScoreSchema> {}
export interface ModEventReport extends v.InferInput<typeof modEventReportSchema> {}
export interface ModEventResolveAppeal extends v.InferInput<typeof modEventResolveAppealSchema> {}
export interface ModEventReverseTakedown extends v.InferInput<typeof modEventReverseTakedownSchema> {}
export interface ModEventTag extends v.InferInput<typeof modEventTagSchema> {}
export interface ModEventTakedown extends v.InferInput<typeof modEventTakedownSchema> {}
export interface ModEventUnmute extends v.InferInput<typeof modEventUnmuteSchema> {}
export interface ModEventUnmuteReporter extends v.InferInput<typeof modEventUnmuteReporterSchema> {}
export interface ModEventView extends v.InferInput<typeof modEventViewSchema> {}
export interface ModEventViewDetail extends v.InferInput<typeof modEventViewDetailSchema> {}
export interface ModTool extends v.InferInput<typeof modToolSchema> {}
export interface Moderation extends v.InferInput<typeof moderationSchema> {}
export interface ModerationDetail extends v.InferInput<typeof moderationDetailSchema> {}
export interface RecordEvent extends v.InferInput<typeof recordEventSchema> {}
export interface RecordHosting extends v.InferInput<typeof recordHostingSchema> {}
export interface RecordView extends v.InferInput<typeof recordViewSchema> {}
export interface RecordViewDetail extends v.InferInput<typeof recordViewDetailSchema> {}
export interface RecordViewNotFound extends v.InferInput<typeof recordViewNotFoundSchema> {}
export interface RecordsStats extends v.InferInput<typeof recordsStatsSchema> {}
export interface RepoView extends v.InferInput<typeof repoViewSchema> {}
export interface RepoViewDetail extends v.InferInput<typeof repoViewDetailSchema> {}
export interface RepoViewNotFound extends v.InferInput<typeof repoViewNotFoundSchema> {}
export interface ReporterStats extends v.InferInput<typeof reporterStatsSchema> {}
export type ReviewClosed = v.InferInput<typeof reviewClosedSchema>;
export type ReviewEscalated = v.InferInput<typeof reviewEscalatedSchema>;
export type ReviewNone = v.InferInput<typeof reviewNoneSchema>;
export type ReviewOpen = v.InferInput<typeof reviewOpenSchema>;
export interface RevokeAccountCredentialsEvent extends v.InferInput<
	typeof revokeAccountCredentialsEventSchema
> {}
export interface ScheduleTakedownEvent extends v.InferInput<typeof scheduleTakedownEventSchema> {}
export interface ScheduledActionView extends v.InferInput<typeof scheduledActionViewSchema> {}
export type SubjectReviewState = v.InferInput<typeof subjectReviewStateSchema>;
export interface SubjectStatusView extends v.InferInput<typeof subjectStatusViewSchema> {}
export interface SubjectView extends v.InferInput<typeof subjectViewSchema> {}
export type TimelineEventPlcCreate = v.InferInput<typeof timelineEventPlcCreateSchema>;
export type TimelineEventPlcOperation = v.InferInput<typeof timelineEventPlcOperationSchema>;
export type TimelineEventPlcTombstone = v.InferInput<typeof timelineEventPlcTombstoneSchema>;
export interface VideoDetails extends v.InferInput<typeof videoDetailsSchema> {}
