import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyEmbedRecord from '../../../app/bsky/embed/record.js';
import * as AppBskyRichtextFacet from '../../../app/bsky/richtext/facet.js';
import * as ChatBskyActorDefs from '../actor/defs.js';

const _convoViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#convoView')),
	id: /*#__PURE__*/ v.string(),
	get lastMessage() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema]));
	},
	get lastReaction() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([messageAndReactionViewSchema]));
	},
	get members() {
		return /*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema);
	},
	muted: /*#__PURE__*/ v.boolean(),
	rev: /*#__PURE__*/ v.string(),
	status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'accepted' | 'request' | (string & {})>()),
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
const _logAcceptConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logAcceptConvo')),
	convoId: /*#__PURE__*/ v.string(),
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
	rev: /*#__PURE__*/ v.string(),
});
const _logBeginConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logBeginConvo')),
	convoId: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _logCreateMessageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logCreateMessage')),
	convoId: /*#__PURE__*/ v.string(),
	get message() {
		return /*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema]);
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
const _logLeaveConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logLeaveConvo')),
	convoId: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _logMuteConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logMuteConvo')),
	convoId: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _logReadMessageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.defs#logReadMessage')),
	convoId: /*#__PURE__*/ v.string(),
	get message() {
		return /*#__PURE__*/ v.variant([deletedMessageViewSchema, messageViewSchema]);
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

type convoView$schematype = typeof _convoViewSchema;
type deletedMessageView$schematype = typeof _deletedMessageViewSchema;
type logAcceptConvo$schematype = typeof _logAcceptConvoSchema;
type logAddReaction$schematype = typeof _logAddReactionSchema;
type logBeginConvo$schematype = typeof _logBeginConvoSchema;
type logCreateMessage$schematype = typeof _logCreateMessageSchema;
type logDeleteMessage$schematype = typeof _logDeleteMessageSchema;
type logLeaveConvo$schematype = typeof _logLeaveConvoSchema;
type logMuteConvo$schematype = typeof _logMuteConvoSchema;
type logReadMessage$schematype = typeof _logReadMessageSchema;
type logRemoveReaction$schematype = typeof _logRemoveReactionSchema;
type logUnmuteConvo$schematype = typeof _logUnmuteConvoSchema;
type messageAndReactionView$schematype = typeof _messageAndReactionViewSchema;
type messageInput$schematype = typeof _messageInputSchema;
type messageRef$schematype = typeof _messageRefSchema;
type messageView$schematype = typeof _messageViewSchema;
type messageViewSender$schematype = typeof _messageViewSenderSchema;
type reactionView$schematype = typeof _reactionViewSchema;
type reactionViewSender$schematype = typeof _reactionViewSenderSchema;

export interface convoViewSchema extends convoView$schematype {}
export interface deletedMessageViewSchema extends deletedMessageView$schematype {}
export interface logAcceptConvoSchema extends logAcceptConvo$schematype {}
export interface logAddReactionSchema extends logAddReaction$schematype {}
export interface logBeginConvoSchema extends logBeginConvo$schematype {}
export interface logCreateMessageSchema extends logCreateMessage$schematype {}
export interface logDeleteMessageSchema extends logDeleteMessage$schematype {}
export interface logLeaveConvoSchema extends logLeaveConvo$schematype {}
export interface logMuteConvoSchema extends logMuteConvo$schematype {}
export interface logReadMessageSchema extends logReadMessage$schematype {}
export interface logRemoveReactionSchema extends logRemoveReaction$schematype {}
export interface logUnmuteConvoSchema extends logUnmuteConvo$schematype {}
export interface messageAndReactionViewSchema extends messageAndReactionView$schematype {}
export interface messageInputSchema extends messageInput$schematype {}
export interface messageRefSchema extends messageRef$schematype {}
export interface messageViewSchema extends messageView$schematype {}
export interface messageViewSenderSchema extends messageViewSender$schematype {}
export interface reactionViewSchema extends reactionView$schematype {}
export interface reactionViewSenderSchema extends reactionViewSender$schematype {}

export const convoViewSchema = _convoViewSchema as convoViewSchema;
export const deletedMessageViewSchema = _deletedMessageViewSchema as deletedMessageViewSchema;
export const logAcceptConvoSchema = _logAcceptConvoSchema as logAcceptConvoSchema;
export const logAddReactionSchema = _logAddReactionSchema as logAddReactionSchema;
export const logBeginConvoSchema = _logBeginConvoSchema as logBeginConvoSchema;
export const logCreateMessageSchema = _logCreateMessageSchema as logCreateMessageSchema;
export const logDeleteMessageSchema = _logDeleteMessageSchema as logDeleteMessageSchema;
export const logLeaveConvoSchema = _logLeaveConvoSchema as logLeaveConvoSchema;
export const logMuteConvoSchema = _logMuteConvoSchema as logMuteConvoSchema;
export const logReadMessageSchema = _logReadMessageSchema as logReadMessageSchema;
export const logRemoveReactionSchema = _logRemoveReactionSchema as logRemoveReactionSchema;
export const logUnmuteConvoSchema = _logUnmuteConvoSchema as logUnmuteConvoSchema;
export const messageAndReactionViewSchema = _messageAndReactionViewSchema as messageAndReactionViewSchema;
export const messageInputSchema = _messageInputSchema as messageInputSchema;
export const messageRefSchema = _messageRefSchema as messageRefSchema;
export const messageViewSchema = _messageViewSchema as messageViewSchema;
export const messageViewSenderSchema = _messageViewSenderSchema as messageViewSenderSchema;
export const reactionViewSchema = _reactionViewSchema as reactionViewSchema;
export const reactionViewSenderSchema = _reactionViewSenderSchema as reactionViewSenderSchema;

export interface ConvoView extends v.InferInput<typeof convoViewSchema> {}
export interface DeletedMessageView extends v.InferInput<typeof deletedMessageViewSchema> {}
export interface LogAcceptConvo extends v.InferInput<typeof logAcceptConvoSchema> {}
export interface LogAddReaction extends v.InferInput<typeof logAddReactionSchema> {}
export interface LogBeginConvo extends v.InferInput<typeof logBeginConvoSchema> {}
export interface LogCreateMessage extends v.InferInput<typeof logCreateMessageSchema> {}
export interface LogDeleteMessage extends v.InferInput<typeof logDeleteMessageSchema> {}
export interface LogLeaveConvo extends v.InferInput<typeof logLeaveConvoSchema> {}
export interface LogMuteConvo extends v.InferInput<typeof logMuteConvoSchema> {}
export interface LogReadMessage extends v.InferInput<typeof logReadMessageSchema> {}
export interface LogRemoveReaction extends v.InferInput<typeof logRemoveReactionSchema> {}
export interface LogUnmuteConvo extends v.InferInput<typeof logUnmuteConvoSchema> {}
export interface MessageAndReactionView extends v.InferInput<typeof messageAndReactionViewSchema> {}
export interface MessageInput extends v.InferInput<typeof messageInputSchema> {}
export interface MessageRef extends v.InferInput<typeof messageRefSchema> {}
export interface MessageView extends v.InferInput<typeof messageViewSchema> {}
export interface MessageViewSender extends v.InferInput<typeof messageViewSenderSchema> {}
export interface ReactionView extends v.InferInput<typeof reactionViewSchema> {}
export interface ReactionViewSender extends v.InferInput<typeof reactionViewSenderSchema> {}
