import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as ChatBskyConvoDefs from '@atcute/bluesky/types/chat/convo/defs';
import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoModerationDefs from '@atcute/atproto/types/moderation/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import * as ComAtprotoServerDefs from '@atcute/atproto/types/server/defs';

const _accountEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#accountEvent')),
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
	appealCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	escalateCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	reportCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	suspendCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	takedownCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
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
	acknowledgeAccountSubjects: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventCommentSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventComment')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	sticky: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _modEventDivertSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventDivert')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventEmailSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventEmail')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	content: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
	durationInHours: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	negateLabelVals: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});
const _modEventMuteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventMute')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	durationInHours: /*#__PURE__*/ v.integer(),
});
const _modEventMuteReporterSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventMuteReporter'),
	),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	durationInHours: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _modEventPriorityScoreSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventPriorityScore'),
	),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	score: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
});
const _modEventReportSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventReport')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	isReporterMuted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get reportType() {
		return ComAtprotoModerationDefs.reasonTypeSchema;
	},
});
const _modEventResolveAppealSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventResolveAppeal'),
	),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventReverseTakedownSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventReverseTakedown'),
	),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventTagSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventTag')),
	add: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	remove: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});
const _modEventTakedownSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventTakedown')),
	acknowledgeAccountSubjects: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	durationInHours: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	policies: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
			/*#__PURE__*/ v.arrayLength(0, 5),
		]),
	),
});
const _modEventUnmuteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventUnmute')),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _modEventUnmuteReporterSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#modEventUnmuteReporter'),
	),
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
		]);
	},
	id: /*#__PURE__*/ v.integer(),
	get subject() {
		return /*#__PURE__*/ v.variant([
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
		]);
	},
	id: /*#__PURE__*/ v.integer(),
	get subject() {
		return /*#__PURE__*/ v.variant([
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
	appealedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	escalatedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	pendingCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	processedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	reportedCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	subjectCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	takendownCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
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
	accountReportCount: /*#__PURE__*/ v.integer(),
	did: /*#__PURE__*/ v.didString(),
	labeledAccountCount: /*#__PURE__*/ v.integer(),
	labeledRecordCount: /*#__PURE__*/ v.integer(),
	recordReportCount: /*#__PURE__*/ v.integer(),
	reportedAccountCount: /*#__PURE__*/ v.integer(),
	reportedRecordCount: /*#__PURE__*/ v.integer(),
	takendownAccountCount: /*#__PURE__*/ v.integer(),
	takendownRecordCount: /*#__PURE__*/ v.integer(),
});
const _reviewClosedSchema = /*#__PURE__*/ v.literal('tools.ozone.moderation.defs#reviewClosed');
const _reviewEscalatedSchema = /*#__PURE__*/ v.literal('tools.ozone.moderation.defs#reviewEscalated');
const _reviewNoneSchema = /*#__PURE__*/ v.literal('tools.ozone.moderation.defs#reviewNone');
const _reviewOpenSchema = /*#__PURE__*/ v.literal('tools.ozone.moderation.defs#reviewOpen');
const _subjectReviewStateSchema = /*#__PURE__*/ v.string<
	'#reviewClosed' | '#reviewEscalated' | '#reviewNone' | '#reviewOpen' | (string & {})
>();
const _subjectStatusViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#subjectStatusView')),
	get accountStats() {
		return /*#__PURE__*/ v.optional(accountStatsSchema);
	},
	appealed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get hosting() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([accountHostingSchema, recordHostingSchema]));
	},
	id: /*#__PURE__*/ v.integer(),
	lastAppealedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	lastReportedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	lastReviewedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	lastReviewedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	muteReportingUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	muteUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	priorityScore: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
	),
	get recordsStats() {
		return /*#__PURE__*/ v.optional(recordsStatsSchema);
	},
	get reviewState() {
		return subjectReviewStateSchema;
	},
	get subject() {
		return /*#__PURE__*/ v.variant([ComAtprotoAdminDefs.repoRefSchema, ComAtprotoRepoStrongRef.mainSchema]);
	},
	subjectBlobCids: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.cidString())),
	subjectRepoHandle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	suspendUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	tags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	takendown: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
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
const _videoDetailsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.moderation.defs#videoDetails')),
	height: /*#__PURE__*/ v.integer(),
	length: /*#__PURE__*/ v.integer(),
	width: /*#__PURE__*/ v.integer(),
});

type accountEvent$schematype = typeof _accountEventSchema;
type accountHosting$schematype = typeof _accountHostingSchema;
type accountStats$schematype = typeof _accountStatsSchema;
type blobView$schematype = typeof _blobViewSchema;
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
type subjectReviewState$schematype = typeof _subjectReviewStateSchema;
type subjectStatusView$schematype = typeof _subjectStatusViewSchema;
type subjectView$schematype = typeof _subjectViewSchema;
type videoDetails$schematype = typeof _videoDetailsSchema;

export interface accountEventSchema extends accountEvent$schematype {}
export interface accountHostingSchema extends accountHosting$schematype {}
export interface accountStatsSchema extends accountStats$schematype {}
export interface blobViewSchema extends blobView$schematype {}
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
export interface subjectReviewStateSchema extends subjectReviewState$schematype {}
export interface subjectStatusViewSchema extends subjectStatusView$schematype {}
export interface subjectViewSchema extends subjectView$schematype {}
export interface videoDetailsSchema extends videoDetails$schematype {}

export const accountEventSchema = _accountEventSchema as accountEventSchema;
export const accountHostingSchema = _accountHostingSchema as accountHostingSchema;
export const accountStatsSchema = _accountStatsSchema as accountStatsSchema;
export const blobViewSchema = _blobViewSchema as blobViewSchema;
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
export const subjectReviewStateSchema = _subjectReviewStateSchema as subjectReviewStateSchema;
export const subjectStatusViewSchema = _subjectStatusViewSchema as subjectStatusViewSchema;
export const subjectViewSchema = _subjectViewSchema as subjectViewSchema;
export const videoDetailsSchema = _videoDetailsSchema as videoDetailsSchema;

export interface AccountEvent extends v.InferInput<typeof accountEventSchema> {}
export interface AccountHosting extends v.InferInput<typeof accountHostingSchema> {}
export interface AccountStats extends v.InferInput<typeof accountStatsSchema> {}
export interface BlobView extends v.InferInput<typeof blobViewSchema> {}
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
export type SubjectReviewState = v.InferInput<typeof subjectReviewStateSchema>;
export interface SubjectStatusView extends v.InferInput<typeof subjectStatusViewSchema> {}
export interface SubjectView extends v.InferInput<typeof subjectViewSchema> {}
export interface VideoDetails extends v.InferInput<typeof videoDetailsSchema> {}
