import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyEmbedRecord from '../../../app/bsky/embed/record.ts';
import * as AppBskyRichtextFacet from '../../../app/bsky/richtext/facet.ts';
import * as ChatBskyActorDefs from '../actor/defs.ts';
import * as ChatBskyGroupDefs from '../group/defs.ts';

const _convoKindSchema = /*#__PURE__*/ v.string<'direct' | 'group' | (string & {})>();
const _convoLockStatusSchema = /*#__PURE__*/ v.string<
	'locked' | 'locked-permanently' | 'unlocked' | (string & {})
>();
const _convoStatusSchema = /*#__PURE__*/ v.string<'accepted' | 'request' | (string & {})>();
const _convoViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#convoView')),
	id: /*#__PURE__*/ v.string(),
	/**
	 * Union field that has data specific to different kinds of convos.
	 */
	get kind() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([directConvoSchema, groupConvoSchema]));
	},
	get lastMessage() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema, systemMessageViewSchema]),
		);
	},
	get lastReaction() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([messageAndReactionViewSchema]));
	},
	/**
	 * Members of this conversation. For direct convos, it will be an immutable list of the 2 members. For group convos, it will a list of important members (the first few members, the viewer, the member who invited the viewer, the member who sent the last message, the member who sent the last reaction), but will not contain the full list of members. Use chat.bsky.convo.getConvoMembers to list all members.
	 */
	get members() {
		return /*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema);
	},
	muted: /*#__PURE__*/ v.boolean(),
	rev: /*#__PURE__*/ v.string(),
	/**
	 * Convo status for the viewer member (not the convo itself).
	 */
	get status() {
		return /*#__PURE__*/ v.optional(convoStatusSchema);
	},
	unreadCount: /*#__PURE__*/ v.integer(),
});
const _deletedMessageViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#deletedMessageView')),
	id: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
	get sender() {
		return messageViewSenderSchema;
	},
	sentAt: /*#__PURE__*/ v.datetimeString(),
});
const _directConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#directConvo')),
});
const _groupConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#groupConvo')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get joinLink() {
		return /*#__PURE__*/ v.optional(ChatBskyGroupDefs.joinLinkViewSchema);
	},
	/**
	 * The lock status of the conversation.
	 */
	get lockStatus() {
		return convoLockStatusSchema;
	},
	/**
	 * The total number of members in the group conversation.
	 */
	memberCount: /*#__PURE__*/ v.integer(),
	/**
	 * The display name of the group conversation.
	 * @maxLength 1280
	 * @maxGraphemes 128
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 1280),
		/*#__PURE__*/ v.stringGraphemes(0, 128),
	]),
});
const _logAcceptConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logAcceptConvo')),
	convoId: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _logAddMemberSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logAddMember')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataAddMember
	 */
	get message() {
		return systemMessageViewSchema;
	},
	/**
	 * Profiles referred in the system message.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logAddReactionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logAddReaction')),
	convoId: /*#__PURE__*/ v.string(),
	get message() {
		return /*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema]);
	},
	get reaction() {
		return reactionViewSchema;
	},
	/**
	 * Profiles referred in the message and reaction views. This isn't required for compatibility, because it was added later, but should generally be present.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema));
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logApproveJoinRequestSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logApproveJoinRequest')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * Prospective member who requested to join.
	 */
	get member() {
		return ChatBskyActorDefs.profileViewBasicSchema;
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logBeginConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logBeginConvo')),
	convoId: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _logCreateJoinLinkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logCreateJoinLink')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataCreateJoinLink
	 */
	get message() {
		return systemMessageViewSchema;
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logCreateMessageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logCreateMessage')),
	convoId: /*#__PURE__*/ v.string(),
	get message() {
		return /*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema]);
	},
	/**
	 * Profiles referred to in the message view. This isn't required for compatibility, because it was added later, but should generally be present.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema));
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logDeleteMessageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logDeleteMessage')),
	convoId: /*#__PURE__*/ v.string(),
	get message() {
		return /*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema]);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logDisableJoinLinkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logDisableJoinLink')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataDisableJoinLink
	 */
	get message() {
		return systemMessageViewSchema;
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logEditGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logEditGroup')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataEditGroup
	 */
	get message() {
		return systemMessageViewSchema;
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logEditJoinLinkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logEditJoinLink')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataEditJoinLink
	 */
	get message() {
		return systemMessageViewSchema;
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logEnableJoinLinkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logEnableJoinLink')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataEnableJoinLink
	 */
	get message() {
		return systemMessageViewSchema;
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logIncomingJoinRequestSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logIncomingJoinRequest')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * Prospective member who requested to join.
	 */
	get member() {
		return ChatBskyActorDefs.profileViewBasicSchema;
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logLeaveConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logLeaveConvo')),
	convoId: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _logLockConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logLockConvo')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataLockConvo
	 */
	get message() {
		return systemMessageViewSchema;
	},
	/**
	 * Profiles referred in the system message.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logLockConvoPermanentlySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logLockConvoPermanently')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataLockConvoPermanently
	 */
	get message() {
		return systemMessageViewSchema;
	},
	/**
	 * Profiles referred in the system message.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logMemberJoinSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logMemberJoin')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataMemberJoin
	 */
	get message() {
		return systemMessageViewSchema;
	},
	/**
	 * Profiles referred in the system message.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logMemberLeaveSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logMemberLeave')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataMemberLeave
	 */
	get message() {
		return systemMessageViewSchema;
	},
	/**
	 * Profiles referred in the system message.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logMuteConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logMuteConvo')),
	convoId: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _logOutgoingJoinRequestSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logOutgoingJoinRequest')),
	convoId: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _logReadConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logReadConvo')),
	convoId: /*#__PURE__*/ v.string(),
	get message() {
		return /*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema, systemMessageViewSchema]);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logReadMessageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logReadMessage')),
	convoId: /*#__PURE__*/ v.string(),
	get message() {
		return /*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema, systemMessageViewSchema]);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logRejectJoinRequestSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logRejectJoinRequest')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * Prospective member who requested to join.
	 */
	get member() {
		return ChatBskyActorDefs.profileViewBasicSchema;
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logRemoveMemberSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logRemoveMember')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataRemoveMember
	 */
	get message() {
		return systemMessageViewSchema;
	},
	/**
	 * Profiles referred in the system message.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logRemoveReactionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logRemoveReaction')),
	convoId: /*#__PURE__*/ v.string(),
	get message() {
		return /*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema]);
	},
	get reaction() {
		return reactionViewSchema;
	},
	/**
	 * Profiles referred in the message and reaction views. This isn't required for compatibility, because it was added later, but should generally be present.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema));
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logUnlockConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logUnlockConvo')),
	convoId: /*#__PURE__*/ v.string(),
	/**
	 * A system message with data of type #systemMessageDataUnlockConvo
	 */
	get message() {
		return systemMessageViewSchema;
	},
	/**
	 * Profiles referred in the system message.
	 */
	get relatedProfiles() {
		return /*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema);
	},
	rev: /*#__PURE__*/ v.string(),
});
const _logUnmuteConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logUnmuteConvo')),
	convoId: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _messageAndReactionViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#messageAndReactionView')),
	get message() {
		return messageViewSchema;
	},
	get reaction() {
		return reactionViewSchema;
	},
});
const _messageInputSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#messageInput')),
	get embed() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([AppBskyEmbedRecord.mainSchema]));
	},
	/**
	 * Annotations of text (mentions, URLs, hashtags, etc)
	 */
	get facets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyRichtextFacet.mainSchema));
	},
	/**
	 * @maxLength 10000
	 * @maxGraphemes 1000
	 */
	text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 10000),
		/*#__PURE__*/ v.stringGraphemes(0, 1000),
	]),
});
const _messageRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#messageRef')),
	convoId: /*#__PURE__*/ v.string(),
	did: /*#__PURE__*/ v.didString(),
	messageId: /*#__PURE__*/ v.string(),
});
const _messageViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#messageView')),
	get embed() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([AppBskyEmbedRecord.viewSchema]));
	},
	/**
	 * Annotations of text (mentions, URLs, hashtags, etc)
	 */
	get facets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyRichtextFacet.mainSchema));
	},
	id: /*#__PURE__*/ v.string(),
	/**
	 * Reactions to this message, in ascending order of creation time.
	 */
	get reactions() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(reactionViewSchema));
	},
	rev: /*#__PURE__*/ v.string(),
	get sender() {
		return messageViewSenderSchema;
	},
	sentAt: /*#__PURE__*/ v.datetimeString(),
	/**
	 * @maxLength 10000
	 * @maxGraphemes 1000
	 */
	text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 10000),
		/*#__PURE__*/ v.stringGraphemes(0, 1000),
	]),
});
const _messageViewSenderSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#messageViewSender')),
	did: /*#__PURE__*/ v.didString(),
});
const _reactionViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#reactionView')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get sender() {
		return reactionViewSenderSchema;
	},
	value: /*#__PURE__*/ v.string(),
});
const _reactionViewSenderSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#reactionViewSender')),
	did: /*#__PURE__*/ v.didString(),
});
const _systemMessageDataAddMemberSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataAddMember')),
	get addedBy() {
		return systemMessageReferredUserSchema;
	},
	/**
	 * Current view of the member who was added.
	 */
	get member() {
		return systemMessageReferredUserSchema;
	},
	/**
	 * Role the user was added to the group with. The role from 'member' will reflect the current data, not historical.
	 */
	get role() {
		return ChatBskyActorDefs.memberRoleSchema;
	},
});
const _systemMessageDataCreateJoinLinkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataCreateJoinLink'),
	),
});
const _systemMessageDataDisableJoinLinkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataDisableJoinLink'),
	),
});
const _systemMessageDataEditGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataEditGroup')),
	/**
	 * Group name that replaced the old.
	 */
	newName: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Group name that was replaced.
	 */
	oldName: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _systemMessageDataEditJoinLinkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataEditJoinLink'),
	),
});
const _systemMessageDataEnableJoinLinkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataEnableJoinLink'),
	),
});
const _systemMessageDataLockConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataLockConvo')),
	/**
	 * Current view of the member who locked the group.
	 */
	get lockedBy() {
		return systemMessageReferredUserSchema;
	},
});
const _systemMessageDataLockConvoPermanentlySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataLockConvoPermanently'),
	),
	/**
	 * Current view of the member who locked the group.
	 */
	get lockedBy() {
		return systemMessageReferredUserSchema;
	},
});
const _systemMessageDataMemberJoinSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataMemberJoin'),
	),
	/**
	 * If join link was configured to require approval, this will be set to who approved the request. Undefined if approval was not required.
	 */
	get approvedBy() {
		return /*#__PURE__*/ v.optional(systemMessageReferredUserSchema);
	},
	/**
	 * Current view of the member who joined.
	 */
	get member() {
		return systemMessageReferredUserSchema;
	},
	/**
	 * Role the user was added to the group with. The role from 'member' will reflect the current data, not historical.
	 */
	get role() {
		return ChatBskyActorDefs.memberRoleSchema;
	},
});
const _systemMessageDataMemberLeaveSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataMemberLeave'),
	),
	/**
	 * Current view of the member who left the group.
	 */
	get member() {
		return systemMessageReferredUserSchema;
	},
});
const _systemMessageDataRemoveMemberSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataRemoveMember'),
	),
	/**
	 * Current view of the member who was removed.
	 */
	get member() {
		return systemMessageReferredUserSchema;
	},
	get removedBy() {
		return systemMessageReferredUserSchema;
	},
});
const _systemMessageDataUnlockConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageDataUnlockConvo'),
	),
	/**
	 * Current view of the member who unlocked the group.
	 */
	get unlockedBy() {
		return systemMessageReferredUserSchema;
	},
});
const _systemMessageReferredUserSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageReferredUser')),
	did: /*#__PURE__*/ v.didString(),
});
const _systemMessageViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#systemMessageView')),
	get data() {
		return /*#__PURE__*/ v.variant([
			systemMessageDataAddMemberSchema,
			systemMessageDataCreateJoinLinkSchema,
			systemMessageDataDisableJoinLinkSchema,
			systemMessageDataEditGroupSchema,
			systemMessageDataEditJoinLinkSchema,
			systemMessageDataEnableJoinLinkSchema,
			systemMessageDataLockConvoSchema,
			systemMessageDataLockConvoPermanentlySchema,
			systemMessageDataMemberJoinSchema,
			systemMessageDataMemberLeaveSchema,
			systemMessageDataRemoveMemberSchema,
			systemMessageDataUnlockConvoSchema,
		]);
	},
	id: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
	sentAt: /*#__PURE__*/ v.datetimeString(),
});

type convoKind$schematype = typeof _convoKindSchema;
type convoLockStatus$schematype = typeof _convoLockStatusSchema;
type convoStatus$schematype = typeof _convoStatusSchema;
type convoView$schematype = typeof _convoViewSchema;
type deletedMessageView$schematype = typeof _deletedMessageViewSchema;
type directConvo$schematype = typeof _directConvoSchema;
type groupConvo$schematype = typeof _groupConvoSchema;
type logAcceptConvo$schematype = typeof _logAcceptConvoSchema;
type logAddMember$schematype = typeof _logAddMemberSchema;
type logAddReaction$schematype = typeof _logAddReactionSchema;
type logApproveJoinRequest$schematype = typeof _logApproveJoinRequestSchema;
type logBeginConvo$schematype = typeof _logBeginConvoSchema;
type logCreateJoinLink$schematype = typeof _logCreateJoinLinkSchema;
type logCreateMessage$schematype = typeof _logCreateMessageSchema;
type logDeleteMessage$schematype = typeof _logDeleteMessageSchema;
type logDisableJoinLink$schematype = typeof _logDisableJoinLinkSchema;
type logEditGroup$schematype = typeof _logEditGroupSchema;
type logEditJoinLink$schematype = typeof _logEditJoinLinkSchema;
type logEnableJoinLink$schematype = typeof _logEnableJoinLinkSchema;
type logIncomingJoinRequest$schematype = typeof _logIncomingJoinRequestSchema;
type logLeaveConvo$schematype = typeof _logLeaveConvoSchema;
type logLockConvo$schematype = typeof _logLockConvoSchema;
type logLockConvoPermanently$schematype = typeof _logLockConvoPermanentlySchema;
type logMemberJoin$schematype = typeof _logMemberJoinSchema;
type logMemberLeave$schematype = typeof _logMemberLeaveSchema;
type logMuteConvo$schematype = typeof _logMuteConvoSchema;
type logOutgoingJoinRequest$schematype = typeof _logOutgoingJoinRequestSchema;
type logReadConvo$schematype = typeof _logReadConvoSchema;
type logReadMessage$schematype = typeof _logReadMessageSchema;
type logRejectJoinRequest$schematype = typeof _logRejectJoinRequestSchema;
type logRemoveMember$schematype = typeof _logRemoveMemberSchema;
type logRemoveReaction$schematype = typeof _logRemoveReactionSchema;
type logUnlockConvo$schematype = typeof _logUnlockConvoSchema;
type logUnmuteConvo$schematype = typeof _logUnmuteConvoSchema;
type messageAndReactionView$schematype = typeof _messageAndReactionViewSchema;
type messageInput$schematype = typeof _messageInputSchema;
type messageRef$schematype = typeof _messageRefSchema;
type messageView$schematype = typeof _messageViewSchema;
type messageViewSender$schematype = typeof _messageViewSenderSchema;
type reactionView$schematype = typeof _reactionViewSchema;
type reactionViewSender$schematype = typeof _reactionViewSenderSchema;
type systemMessageDataAddMember$schematype = typeof _systemMessageDataAddMemberSchema;
type systemMessageDataCreateJoinLink$schematype = typeof _systemMessageDataCreateJoinLinkSchema;
type systemMessageDataDisableJoinLink$schematype = typeof _systemMessageDataDisableJoinLinkSchema;
type systemMessageDataEditGroup$schematype = typeof _systemMessageDataEditGroupSchema;
type systemMessageDataEditJoinLink$schematype = typeof _systemMessageDataEditJoinLinkSchema;
type systemMessageDataEnableJoinLink$schematype = typeof _systemMessageDataEnableJoinLinkSchema;
type systemMessageDataLockConvo$schematype = typeof _systemMessageDataLockConvoSchema;
type systemMessageDataLockConvoPermanently$schematype = typeof _systemMessageDataLockConvoPermanentlySchema;
type systemMessageDataMemberJoin$schematype = typeof _systemMessageDataMemberJoinSchema;
type systemMessageDataMemberLeave$schematype = typeof _systemMessageDataMemberLeaveSchema;
type systemMessageDataRemoveMember$schematype = typeof _systemMessageDataRemoveMemberSchema;
type systemMessageDataUnlockConvo$schematype = typeof _systemMessageDataUnlockConvoSchema;
type systemMessageReferredUser$schematype = typeof _systemMessageReferredUserSchema;
type systemMessageView$schematype = typeof _systemMessageViewSchema;

export interface convoKindSchema extends convoKind$schematype {}
export interface convoLockStatusSchema extends convoLockStatus$schematype {}
export interface convoStatusSchema extends convoStatus$schematype {}
export interface convoViewSchema extends convoView$schematype {}
export interface deletedMessageViewSchema extends deletedMessageView$schematype {}
export interface directConvoSchema extends directConvo$schematype {}
export interface groupConvoSchema extends groupConvo$schematype {}
export interface logAcceptConvoSchema extends logAcceptConvo$schematype {}
export interface logAddMemberSchema extends logAddMember$schematype {}
export interface logAddReactionSchema extends logAddReaction$schematype {}
export interface logApproveJoinRequestSchema extends logApproveJoinRequest$schematype {}
export interface logBeginConvoSchema extends logBeginConvo$schematype {}
export interface logCreateJoinLinkSchema extends logCreateJoinLink$schematype {}
export interface logCreateMessageSchema extends logCreateMessage$schematype {}
export interface logDeleteMessageSchema extends logDeleteMessage$schematype {}
export interface logDisableJoinLinkSchema extends logDisableJoinLink$schematype {}
export interface logEditGroupSchema extends logEditGroup$schematype {}
export interface logEditJoinLinkSchema extends logEditJoinLink$schematype {}
export interface logEnableJoinLinkSchema extends logEnableJoinLink$schematype {}
export interface logIncomingJoinRequestSchema extends logIncomingJoinRequest$schematype {}
export interface logLeaveConvoSchema extends logLeaveConvo$schematype {}
export interface logLockConvoSchema extends logLockConvo$schematype {}
export interface logLockConvoPermanentlySchema extends logLockConvoPermanently$schematype {}
export interface logMemberJoinSchema extends logMemberJoin$schematype {}
export interface logMemberLeaveSchema extends logMemberLeave$schematype {}
export interface logMuteConvoSchema extends logMuteConvo$schematype {}
export interface logOutgoingJoinRequestSchema extends logOutgoingJoinRequest$schematype {}
export interface logReadConvoSchema extends logReadConvo$schematype {}
export interface logReadMessageSchema extends logReadMessage$schematype {}
export interface logRejectJoinRequestSchema extends logRejectJoinRequest$schematype {}
export interface logRemoveMemberSchema extends logRemoveMember$schematype {}
export interface logRemoveReactionSchema extends logRemoveReaction$schematype {}
export interface logUnlockConvoSchema extends logUnlockConvo$schematype {}
export interface logUnmuteConvoSchema extends logUnmuteConvo$schematype {}
export interface messageAndReactionViewSchema extends messageAndReactionView$schematype {}
export interface messageInputSchema extends messageInput$schematype {}
export interface messageRefSchema extends messageRef$schematype {}
export interface messageViewSchema extends messageView$schematype {}
export interface messageViewSenderSchema extends messageViewSender$schematype {}
export interface reactionViewSchema extends reactionView$schematype {}
export interface reactionViewSenderSchema extends reactionViewSender$schematype {}
export interface systemMessageDataAddMemberSchema extends systemMessageDataAddMember$schematype {}
export interface systemMessageDataCreateJoinLinkSchema extends systemMessageDataCreateJoinLink$schematype {}
export interface systemMessageDataDisableJoinLinkSchema extends systemMessageDataDisableJoinLink$schematype {}
export interface systemMessageDataEditGroupSchema extends systemMessageDataEditGroup$schematype {}
export interface systemMessageDataEditJoinLinkSchema extends systemMessageDataEditJoinLink$schematype {}
export interface systemMessageDataEnableJoinLinkSchema extends systemMessageDataEnableJoinLink$schematype {}
export interface systemMessageDataLockConvoSchema extends systemMessageDataLockConvo$schematype {}
export interface systemMessageDataLockConvoPermanentlySchema extends systemMessageDataLockConvoPermanently$schematype {}
export interface systemMessageDataMemberJoinSchema extends systemMessageDataMemberJoin$schematype {}
export interface systemMessageDataMemberLeaveSchema extends systemMessageDataMemberLeave$schematype {}
export interface systemMessageDataRemoveMemberSchema extends systemMessageDataRemoveMember$schematype {}
export interface systemMessageDataUnlockConvoSchema extends systemMessageDataUnlockConvo$schematype {}
export interface systemMessageReferredUserSchema extends systemMessageReferredUser$schematype {}
export interface systemMessageViewSchema extends systemMessageView$schematype {}

export const convoKindSchema = _convoKindSchema as convoKindSchema;
export const convoLockStatusSchema = _convoLockStatusSchema as convoLockStatusSchema;
export const convoStatusSchema = _convoStatusSchema as convoStatusSchema;
export const convoViewSchema = _convoViewSchema as convoViewSchema;
export const deletedMessageViewSchema = _deletedMessageViewSchema as deletedMessageViewSchema;
export const directConvoSchema = _directConvoSchema as directConvoSchema;
export const groupConvoSchema = _groupConvoSchema as groupConvoSchema;
export const logAcceptConvoSchema = _logAcceptConvoSchema as logAcceptConvoSchema;
export const logAddMemberSchema = _logAddMemberSchema as logAddMemberSchema;
export const logAddReactionSchema = _logAddReactionSchema as logAddReactionSchema;
export const logApproveJoinRequestSchema = _logApproveJoinRequestSchema as logApproveJoinRequestSchema;
export const logBeginConvoSchema = _logBeginConvoSchema as logBeginConvoSchema;
export const logCreateJoinLinkSchema = _logCreateJoinLinkSchema as logCreateJoinLinkSchema;
export const logCreateMessageSchema = _logCreateMessageSchema as logCreateMessageSchema;
export const logDeleteMessageSchema = _logDeleteMessageSchema as logDeleteMessageSchema;
export const logDisableJoinLinkSchema = _logDisableJoinLinkSchema as logDisableJoinLinkSchema;
export const logEditGroupSchema = _logEditGroupSchema as logEditGroupSchema;
export const logEditJoinLinkSchema = _logEditJoinLinkSchema as logEditJoinLinkSchema;
export const logEnableJoinLinkSchema = _logEnableJoinLinkSchema as logEnableJoinLinkSchema;
export const logIncomingJoinRequestSchema = _logIncomingJoinRequestSchema as logIncomingJoinRequestSchema;
export const logLeaveConvoSchema = _logLeaveConvoSchema as logLeaveConvoSchema;
export const logLockConvoSchema = _logLockConvoSchema as logLockConvoSchema;
export const logLockConvoPermanentlySchema = _logLockConvoPermanentlySchema as logLockConvoPermanentlySchema;
export const logMemberJoinSchema = _logMemberJoinSchema as logMemberJoinSchema;
export const logMemberLeaveSchema = _logMemberLeaveSchema as logMemberLeaveSchema;
export const logMuteConvoSchema = _logMuteConvoSchema as logMuteConvoSchema;
export const logOutgoingJoinRequestSchema = _logOutgoingJoinRequestSchema as logOutgoingJoinRequestSchema;
export const logReadConvoSchema = _logReadConvoSchema as logReadConvoSchema;
export const logReadMessageSchema = _logReadMessageSchema as logReadMessageSchema;
export const logRejectJoinRequestSchema = _logRejectJoinRequestSchema as logRejectJoinRequestSchema;
export const logRemoveMemberSchema = _logRemoveMemberSchema as logRemoveMemberSchema;
export const logRemoveReactionSchema = _logRemoveReactionSchema as logRemoveReactionSchema;
export const logUnlockConvoSchema = _logUnlockConvoSchema as logUnlockConvoSchema;
export const logUnmuteConvoSchema = _logUnmuteConvoSchema as logUnmuteConvoSchema;
export const messageAndReactionViewSchema = _messageAndReactionViewSchema as messageAndReactionViewSchema;
export const messageInputSchema = _messageInputSchema as messageInputSchema;
export const messageRefSchema = _messageRefSchema as messageRefSchema;
export const messageViewSchema = _messageViewSchema as messageViewSchema;
export const messageViewSenderSchema = _messageViewSenderSchema as messageViewSenderSchema;
export const reactionViewSchema = _reactionViewSchema as reactionViewSchema;
export const reactionViewSenderSchema = _reactionViewSenderSchema as reactionViewSenderSchema;
export const systemMessageDataAddMemberSchema =
	_systemMessageDataAddMemberSchema as systemMessageDataAddMemberSchema;
export const systemMessageDataCreateJoinLinkSchema =
	_systemMessageDataCreateJoinLinkSchema as systemMessageDataCreateJoinLinkSchema;
export const systemMessageDataDisableJoinLinkSchema =
	_systemMessageDataDisableJoinLinkSchema as systemMessageDataDisableJoinLinkSchema;
export const systemMessageDataEditGroupSchema =
	_systemMessageDataEditGroupSchema as systemMessageDataEditGroupSchema;
export const systemMessageDataEditJoinLinkSchema =
	_systemMessageDataEditJoinLinkSchema as systemMessageDataEditJoinLinkSchema;
export const systemMessageDataEnableJoinLinkSchema =
	_systemMessageDataEnableJoinLinkSchema as systemMessageDataEnableJoinLinkSchema;
export const systemMessageDataLockConvoSchema =
	_systemMessageDataLockConvoSchema as systemMessageDataLockConvoSchema;
export const systemMessageDataLockConvoPermanentlySchema =
	_systemMessageDataLockConvoPermanentlySchema as systemMessageDataLockConvoPermanentlySchema;
export const systemMessageDataMemberJoinSchema =
	_systemMessageDataMemberJoinSchema as systemMessageDataMemberJoinSchema;
export const systemMessageDataMemberLeaveSchema =
	_systemMessageDataMemberLeaveSchema as systemMessageDataMemberLeaveSchema;
export const systemMessageDataRemoveMemberSchema =
	_systemMessageDataRemoveMemberSchema as systemMessageDataRemoveMemberSchema;
export const systemMessageDataUnlockConvoSchema =
	_systemMessageDataUnlockConvoSchema as systemMessageDataUnlockConvoSchema;
export const systemMessageReferredUserSchema =
	_systemMessageReferredUserSchema as systemMessageReferredUserSchema;
export const systemMessageViewSchema = _systemMessageViewSchema as systemMessageViewSchema;

export type ConvoKind = v.InferInput<typeof convoKindSchema>;
export type ConvoLockStatus = v.InferInput<typeof convoLockStatusSchema>;
export type ConvoStatus = v.InferInput<typeof convoStatusSchema>;
export interface ConvoView extends v.InferInput<typeof convoViewSchema> {}
export interface DeletedMessageView extends v.InferInput<typeof deletedMessageViewSchema> {}
export interface DirectConvo extends v.InferInput<typeof directConvoSchema> {}
export interface GroupConvo extends v.InferInput<typeof groupConvoSchema> {}
export interface LogAcceptConvo extends v.InferInput<typeof logAcceptConvoSchema> {}
export interface LogAddMember extends v.InferInput<typeof logAddMemberSchema> {}
export interface LogAddReaction extends v.InferInput<typeof logAddReactionSchema> {}
export interface LogApproveJoinRequest extends v.InferInput<typeof logApproveJoinRequestSchema> {}
export interface LogBeginConvo extends v.InferInput<typeof logBeginConvoSchema> {}
export interface LogCreateJoinLink extends v.InferInput<typeof logCreateJoinLinkSchema> {}
export interface LogCreateMessage extends v.InferInput<typeof logCreateMessageSchema> {}
export interface LogDeleteMessage extends v.InferInput<typeof logDeleteMessageSchema> {}
export interface LogDisableJoinLink extends v.InferInput<typeof logDisableJoinLinkSchema> {}
export interface LogEditGroup extends v.InferInput<typeof logEditGroupSchema> {}
export interface LogEditJoinLink extends v.InferInput<typeof logEditJoinLinkSchema> {}
export interface LogEnableJoinLink extends v.InferInput<typeof logEnableJoinLinkSchema> {}
export interface LogIncomingJoinRequest extends v.InferInput<typeof logIncomingJoinRequestSchema> {}
export interface LogLeaveConvo extends v.InferInput<typeof logLeaveConvoSchema> {}
export interface LogLockConvo extends v.InferInput<typeof logLockConvoSchema> {}
export interface LogLockConvoPermanently extends v.InferInput<typeof logLockConvoPermanentlySchema> {}
export interface LogMemberJoin extends v.InferInput<typeof logMemberJoinSchema> {}
export interface LogMemberLeave extends v.InferInput<typeof logMemberLeaveSchema> {}
export interface LogMuteConvo extends v.InferInput<typeof logMuteConvoSchema> {}
export interface LogOutgoingJoinRequest extends v.InferInput<typeof logOutgoingJoinRequestSchema> {}
export interface LogReadConvo extends v.InferInput<typeof logReadConvoSchema> {}
export interface LogReadMessage extends v.InferInput<typeof logReadMessageSchema> {}
export interface LogRejectJoinRequest extends v.InferInput<typeof logRejectJoinRequestSchema> {}
export interface LogRemoveMember extends v.InferInput<typeof logRemoveMemberSchema> {}
export interface LogRemoveReaction extends v.InferInput<typeof logRemoveReactionSchema> {}
export interface LogUnlockConvo extends v.InferInput<typeof logUnlockConvoSchema> {}
export interface LogUnmuteConvo extends v.InferInput<typeof logUnmuteConvoSchema> {}
export interface MessageAndReactionView extends v.InferInput<typeof messageAndReactionViewSchema> {}
export interface MessageInput extends v.InferInput<typeof messageInputSchema> {}
export interface MessageRef extends v.InferInput<typeof messageRefSchema> {}
export interface MessageView extends v.InferInput<typeof messageViewSchema> {}
export interface MessageViewSender extends v.InferInput<typeof messageViewSenderSchema> {}
export interface ReactionView extends v.InferInput<typeof reactionViewSchema> {}
export interface ReactionViewSender extends v.InferInput<typeof reactionViewSenderSchema> {}
export interface SystemMessageDataAddMember extends v.InferInput<typeof systemMessageDataAddMemberSchema> {}
export interface SystemMessageDataCreateJoinLink extends v.InferInput<
	typeof systemMessageDataCreateJoinLinkSchema
> {}
export interface SystemMessageDataDisableJoinLink extends v.InferInput<
	typeof systemMessageDataDisableJoinLinkSchema
> {}
export interface SystemMessageDataEditGroup extends v.InferInput<typeof systemMessageDataEditGroupSchema> {}
export interface SystemMessageDataEditJoinLink extends v.InferInput<
	typeof systemMessageDataEditJoinLinkSchema
> {}
export interface SystemMessageDataEnableJoinLink extends v.InferInput<
	typeof systemMessageDataEnableJoinLinkSchema
> {}
export interface SystemMessageDataLockConvo extends v.InferInput<typeof systemMessageDataLockConvoSchema> {}
export interface SystemMessageDataLockConvoPermanently extends v.InferInput<
	typeof systemMessageDataLockConvoPermanentlySchema
> {}
export interface SystemMessageDataMemberJoin extends v.InferInput<typeof systemMessageDataMemberJoinSchema> {}
export interface SystemMessageDataMemberLeave extends v.InferInput<
	typeof systemMessageDataMemberLeaveSchema
> {}
export interface SystemMessageDataRemoveMember extends v.InferInput<
	typeof systemMessageDataRemoveMemberSchema
> {}
export interface SystemMessageDataUnlockConvo extends v.InferInput<
	typeof systemMessageDataUnlockConvoSchema
> {}
export interface SystemMessageReferredUser extends v.InferInput<typeof systemMessageReferredUserSchema> {}
export interface SystemMessageView extends v.InferInput<typeof systemMessageViewSchema> {}
