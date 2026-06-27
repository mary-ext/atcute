import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyConvoDefs from '../convo/defs.ts';
import * as ChatBskyGroupDefs from '../group/defs.ts';

const _convoViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.moderation.defs#convoView')),
	id: /*#__PURE__*/ v.string(),
	/** Union field that has data specific to different kinds of convos. */
	get kind() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([directConvoSchema, groupConvoSchema]));
	},
	rev: /*#__PURE__*/ v.string(),
});
const _directConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.moderation.defs#directConvo')),
});
const _groupConvoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.moderation.defs#groupConvo')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get joinLink() {
		return /*#__PURE__*/ v.optional(ChatBskyGroupDefs.joinLinkViewSchema);
	},
	/**
	 * The total number of pending join requests for the group conversation. This information is only visible to
	 * the owner and to moderators. Capped at 21.
	 */
	joinRequestCount: /*#__PURE__*/ v.integer(),
	/** The lock status of the conversation. */
	get lockStatus() {
		return ChatBskyConvoDefs.convoLockStatusSchema;
	},
	/** The total number of members in the group conversation. */
	memberCount: /*#__PURE__*/ v.integer(),
	/** The maximum number of members allowed in the group conversation. */
	memberLimit: /*#__PURE__*/ v.integer(),
	/**
	 * The display name of the group conversation.
	 *
	 * @maxLength 500
	 * @maxGraphemes 50
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 500),
		/*#__PURE__*/ v.stringGraphemes(0, 50),
	]),
});

type convoView$schematype = typeof _convoViewSchema;
type directConvo$schematype = typeof _directConvoSchema;
type groupConvo$schematype = typeof _groupConvoSchema;

export interface convoViewSchema extends convoView$schematype {}
export interface directConvoSchema extends directConvo$schematype {}
export interface groupConvoSchema extends groupConvo$schematype {}

export const convoViewSchema = _convoViewSchema as convoViewSchema;
export const directConvoSchema = _directConvoSchema as directConvoSchema;
export const groupConvoSchema = _groupConvoSchema as groupConvoSchema;

export interface ConvoView extends v.InferInput<typeof convoViewSchema> {}
export interface DirectConvo extends v.InferInput<typeof directConvoSchema> {}
export interface GroupConvo extends v.InferInput<typeof groupConvoSchema> {}
