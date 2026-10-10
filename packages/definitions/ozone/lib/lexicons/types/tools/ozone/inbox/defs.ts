import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _actionViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#actionView')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	expiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Action ID (moderation event ID). */
	id: /*#__PURE__*/ v.integer(),
	/** Label values, for labelApplied/labelRemoved. */
	labels: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	/** Policies applied by a takedown action. */
	get policies() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(policyViewSchema));
	},
	reversedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	scope: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'app' | 'labelOnly' | 'network' | (string & {})>()),
	/** Public action type. */
	type: /*#__PURE__*/ v.string(),
});
const _appealViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#appealView')),
	appealableUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	appealedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** When the appeal's report was closed. */
	resolvedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	state: /*#__PURE__*/ v.string<'expired' | 'none' | 'pending' | 'resolved' | 'superseded' | (string & {})>(),
});
const _enforcementViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#enforcementView')),
	expiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Active label values on the subject, excluding negated and expired labels. */
	labels: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	scope: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'app' | 'labelOnly' | 'network' | (string & {})>()),
	state: /*#__PURE__*/ v.string<'labeled' | 'none' | 'removed' | 'suspended' | 'takendown' | (string & {})>(),
});
const _notificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#notification')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	id: /*#__PURE__*/ v.integer(),
	isRead: /*#__PURE__*/ v.boolean(),
	reason: /*#__PURE__*/ v.string<
		| 'actionReversed'
		| 'actionTaken'
		| 'appealResolved'
		| 'reportReopened'
		| 'reportResolved'
		| 'standingChanged'
		| (string & {})
	>(),
	get target() {
		return /*#__PURE__*/ v.variant([reportRefSchema, standingRefSchema, subjectRefSchema]);
	},
});
const _notificationPreferencesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#notificationPreferences')),
	push: /*#__PURE__*/ v.boolean(),
});
const _policyViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#policyView')),
	displayName: /*#__PURE__*/ v.string(),
	key: /*#__PURE__*/ v.string(),
	link: /*#__PURE__*/ v.genericUriString(),
});
const _reportRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#reportRef')),
	reportId: /*#__PURE__*/ v.integer(),
	status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'pending' | 'resolved' | (string & {})>()),
	get subject() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([ComAtprotoAdminDefs.repoRefSchema, ComAtprotoRepoStrongRef.mainSchema]),
		);
	},
});
const _reportsSummarySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#reportsSummary')),
	/**
	 * Day of the earliest report, truncated to midnight UTC. Render as a date; the time component is not
	 * meaningful.
	 */
	firstReportedOn: /*#__PURE__*/ v.datetimeString(),
	/**
	 * Day of the most recent report, truncated to midnight UTC. Render as a date; the time component is not
	 * meaningful.
	 */
	lastReportedOn: /*#__PURE__*/ v.datetimeString(),
	/** Distinct reason types reported, deduplicated and unordered. Excludes reasonAppeal. */
	reasonTypes: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});
const _standingRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#standingRef')),
	previousStanding: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'atRisk' | 'good' | 'warning' | (string & {})>(),
	),
	standing: /*#__PURE__*/ v.string<'atRisk' | 'good' | 'warning' | (string & {})>(),
});
const _subjectRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#subjectRef')),
	actionId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	actionType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get subject() {
		return /*#__PURE__*/ v.variant([ComAtprotoAdminDefs.repoRefSchema, ComAtprotoRepoStrongRef.mainSchema]);
	},
});
const _subjectViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#subjectView')),
	actionCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get appeal() {
		return /*#__PURE__*/ v.optional(appealViewSchema);
	},
	availableActions: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'appeal' | (string & {})>()),
	),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get enforcement() {
		return enforcementViewSchema;
	},
	isRead: /*#__PURE__*/ v.boolean(),
	get latestAction() {
		return /*#__PURE__*/ v.optional(actionViewSchema);
	},
	/** DID of the moderation service that took the actions. */
	src: /*#__PURE__*/ v.didString(),
	get subject() {
		return /*#__PURE__*/ v.variant([ComAtprotoAdminDefs.repoRefSchema, ComAtprotoRepoStrongRef.mainSchema]);
	},
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});
const _subjectViewDetailSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#subjectViewDetail')),
	/**
	 * A page of action history, most recent first. Reversal timestamps include changes outside this page.
	 *
	 * @maxLength 100
	 */
	get actions() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(actionViewSchema), [
			/*#__PURE__*/ v.arrayLength(0, 100),
		]);
	},
	get appeal() {
		return /*#__PURE__*/ v.optional(appealViewSchema);
	},
	availableActions: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'appeal' | (string & {})>()),
	),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Cursor for the next page of action history. Omitted when no older actions remain. */
	cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get enforcement() {
		return enforcementViewSchema;
	},
	isRead: /*#__PURE__*/ v.boolean(),
	/** Raw record JSON for the subject, when the subject is a record and the record is available. */
	record: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
	/** Omitted when the subject has never been reported, e.g. proactive enforcement. */
	get reports() {
		return /*#__PURE__*/ v.optional(reportsSummarySchema);
	},
	src: /*#__PURE__*/ v.didString(),
	get subject() {
		return /*#__PURE__*/ v.variant([ComAtprotoAdminDefs.repoRefSchema, ComAtprotoRepoStrongRef.mainSchema]);
	},
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});

type actionView$schematype = typeof _actionViewSchema;
type appealView$schematype = typeof _appealViewSchema;
type enforcementView$schematype = typeof _enforcementViewSchema;
type notification$schematype = typeof _notificationSchema;
type notificationPreferences$schematype = typeof _notificationPreferencesSchema;
type policyView$schematype = typeof _policyViewSchema;
type reportRef$schematype = typeof _reportRefSchema;
type reportsSummary$schematype = typeof _reportsSummarySchema;
type standingRef$schematype = typeof _standingRefSchema;
type subjectRef$schematype = typeof _subjectRefSchema;
type subjectView$schematype = typeof _subjectViewSchema;
type subjectViewDetail$schematype = typeof _subjectViewDetailSchema;

export interface actionViewSchema extends actionView$schematype {}
export interface appealViewSchema extends appealView$schematype {}
export interface enforcementViewSchema extends enforcementView$schematype {}
export interface notificationSchema extends notification$schematype {}
export interface notificationPreferencesSchema extends notificationPreferences$schematype {}
export interface policyViewSchema extends policyView$schematype {}
export interface reportRefSchema extends reportRef$schematype {}
export interface reportsSummarySchema extends reportsSummary$schematype {}
export interface standingRefSchema extends standingRef$schematype {}
export interface subjectRefSchema extends subjectRef$schematype {}
export interface subjectViewSchema extends subjectView$schematype {}
export interface subjectViewDetailSchema extends subjectViewDetail$schematype {}

export const actionViewSchema = _actionViewSchema as actionViewSchema;
export const appealViewSchema = _appealViewSchema as appealViewSchema;
export const enforcementViewSchema = _enforcementViewSchema as enforcementViewSchema;
export const notificationSchema = _notificationSchema as notificationSchema;
export const notificationPreferencesSchema = _notificationPreferencesSchema as notificationPreferencesSchema;
export const policyViewSchema = _policyViewSchema as policyViewSchema;
export const reportRefSchema = _reportRefSchema as reportRefSchema;
export const reportsSummarySchema = _reportsSummarySchema as reportsSummarySchema;
export const standingRefSchema = _standingRefSchema as standingRefSchema;
export const subjectRefSchema = _subjectRefSchema as subjectRefSchema;
export const subjectViewSchema = _subjectViewSchema as subjectViewSchema;
export const subjectViewDetailSchema = _subjectViewDetailSchema as subjectViewDetailSchema;

export interface ActionView extends v.InferInput<typeof actionViewSchema> {}
export interface AppealView extends v.InferInput<typeof appealViewSchema> {}
export interface EnforcementView extends v.InferInput<typeof enforcementViewSchema> {}
export interface Notification extends v.InferInput<typeof notificationSchema> {}
export interface NotificationPreferences extends v.InferInput<typeof notificationPreferencesSchema> {}
export interface PolicyView extends v.InferInput<typeof policyViewSchema> {}
export interface ReportRef extends v.InferInput<typeof reportRefSchema> {}
export interface ReportsSummary extends v.InferInput<typeof reportsSummarySchema> {}
export interface StandingRef extends v.InferInput<typeof standingRefSchema> {}
export interface SubjectRef extends v.InferInput<typeof subjectRefSchema> {}
export interface SubjectView extends v.InferInput<typeof subjectViewSchema> {}
export interface SubjectViewDetail extends v.InferInput<typeof subjectViewDetailSchema> {}
