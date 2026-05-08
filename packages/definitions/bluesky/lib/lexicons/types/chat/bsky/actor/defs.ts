import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyActorDefs from '../../../app/bsky/actor/defs.ts';

const _directConvoMemberSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.actor.defs#directConvoMember')),
});
const _groupConvoMemberSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.actor.defs#groupConvoMember')),
	/**
	 * Who added this member. Only present if the member was added (instead of joining via link).
	 */
	get addedBy() {
		return /*#__PURE__*/ v.optional(profileViewBasicSchema);
	},
	/**
	 * The member's role within this conversation. Only present in group conversation member lists.
	 */
	get role() {
		return memberRoleSchema;
	},
});
const _memberRoleSchema = /*#__PURE__*/ v.string<'owner' | 'standard' | (string & {})>();
const _pastGroupConvoMemberSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.actor.defs#pastGroupConvoMember')),
});
const _profileViewBasicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.actor.defs#profileViewBasic')),
	get associated() {
		return /*#__PURE__*/ v.optional(AppBskyActorDefs.profileAssociatedSchema);
	},
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	/**
	 * Set to true when the actor cannot actively participate in conversations
	 */
	chatDisabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	did: /*#__PURE__*/ v.didString(),
	/**
	 * @maxLength 640
	 * @maxGraphemes 64
	 */
	displayName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 640),
			/*#__PURE__*/ v.stringGraphemes(0, 64),
		]),
	),
	handle: /*#__PURE__*/ v.handleString(),
	/**
	 * Union field that has data specific to different kinds of convos.
	 */
	get kind() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([directConvoMemberSchema, groupConvoMemberSchema, pastGroupConvoMemberSchema]),
		);
	},
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	get verification() {
		return /*#__PURE__*/ v.optional(AppBskyActorDefs.verificationStateSchema);
	},
	get viewer() {
		return /*#__PURE__*/ v.optional(AppBskyActorDefs.viewerStateSchema);
	},
});

type directConvoMember$schematype = typeof _directConvoMemberSchema;
type groupConvoMember$schematype = typeof _groupConvoMemberSchema;
type memberRole$schematype = typeof _memberRoleSchema;
type pastGroupConvoMember$schematype = typeof _pastGroupConvoMemberSchema;
type profileViewBasic$schematype = typeof _profileViewBasicSchema;

export interface directConvoMemberSchema extends directConvoMember$schematype {}
export interface groupConvoMemberSchema extends groupConvoMember$schematype {}
export interface memberRoleSchema extends memberRole$schematype {}
export interface pastGroupConvoMemberSchema extends pastGroupConvoMember$schematype {}
export interface profileViewBasicSchema extends profileViewBasic$schematype {}

export const directConvoMemberSchema = _directConvoMemberSchema as directConvoMemberSchema;
export const groupConvoMemberSchema = _groupConvoMemberSchema as groupConvoMemberSchema;
export const memberRoleSchema = _memberRoleSchema as memberRoleSchema;
export const pastGroupConvoMemberSchema = _pastGroupConvoMemberSchema as pastGroupConvoMemberSchema;
export const profileViewBasicSchema = _profileViewBasicSchema as profileViewBasicSchema;

export interface DirectConvoMember extends v.InferInput<typeof directConvoMemberSchema> {}
export interface GroupConvoMember extends v.InferInput<typeof groupConvoMemberSchema> {}
export type MemberRole = v.InferInput<typeof memberRoleSchema>;
export interface PastGroupConvoMember extends v.InferInput<typeof pastGroupConvoMemberSchema> {}
export interface ProfileViewBasic extends v.InferInput<typeof profileViewBasicSchema> {}
