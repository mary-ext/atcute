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
	/** Policies that were applied in this action. */
	policies: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	reversedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	scope: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'app' | 'labelOnly' | 'network' | (string & {})>()),
	/** Public action type. */
	type: /*#__PURE__*/ v.string(),
});
const _appealViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.defs#appealView')),
	appealableUntil: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	appealedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Moderator explanation, from the publicNote on the closing activity. Absent if none was written. */
	note: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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

type actionView$schematype = typeof _actionViewSchema;
type appealView$schematype = typeof _appealViewSchema;
type enforcementView$schematype = typeof _enforcementViewSchema;
type subjectView$schematype = typeof _subjectViewSchema;

export interface actionViewSchema extends actionView$schematype {}
export interface appealViewSchema extends appealView$schematype {}
export interface enforcementViewSchema extends enforcementView$schematype {}
export interface subjectViewSchema extends subjectView$schematype {}

export const actionViewSchema = _actionViewSchema as actionViewSchema;
export const appealViewSchema = _appealViewSchema as appealViewSchema;
export const enforcementViewSchema = _enforcementViewSchema as enforcementViewSchema;
export const subjectViewSchema = _subjectViewSchema as subjectViewSchema;

export interface ActionView extends v.InferInput<typeof actionViewSchema> {}
export interface AppealView extends v.InferInput<typeof appealViewSchema> {}
export interface EnforcementView extends v.InferInput<typeof enforcementViewSchema> {}
export interface SubjectView extends v.InferInput<typeof subjectViewSchema> {}
