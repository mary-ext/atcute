import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _eventChatAcceptedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventChatAccepted'),
	),
	/** The DID of the person accepting the convo. */
	actorDid: /*#__PURE__*/ v.didString(),
	/** When the convo was originally created. */
	convoCreatedAt: /*#__PURE__*/ v.datetimeString(),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Current member count at the time of the event. Only present for group convos. */
	groupMemberCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** The name of the group chat. Only present for group convos. */
	groupName: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** How the convo was accepted. */
	method: /*#__PURE__*/ v.string<'explicit' | 'message' | (string & {})>(),
	/** The DID of the group chat owner. Only present for group convos. */
	ownerDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	rev: /*#__PURE__*/ v.string(),
});
const _eventConvoFirstMessageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventConvoFirstMessage'),
	),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	messageId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The list of DIDs message recipients. Does not include the sender, which is in the `user` field */
	recipients: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
	rev: /*#__PURE__*/ v.string(),
	/** The DID of the message author. */
	user: /*#__PURE__*/ v.didString(),
});
const _eventGroupChatCreatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventGroupChatCreated'),
	),
	/** The DID of the actor performing the action. For this event, same as ownerDid. */
	actorDid: /*#__PURE__*/ v.didString(),
	/** When the group was originally created. */
	convoCreatedAt: /*#__PURE__*/ v.datetimeString(),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Current member count at the time of the event. */
	groupMemberCount: /*#__PURE__*/ v.integer(),
	/** The name set at creation time. */
	groupName: /*#__PURE__*/ v.string(),
	/** DIDs of everyone added at creation time. */
	initialMemberDids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
	/** The DID of the group chat owner. */
	ownerDid: /*#__PURE__*/ v.didString(),
	rev: /*#__PURE__*/ v.string(),
});
const _eventGroupChatJoinRequestSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventGroupChatJoinRequest'),
	),
	/** The DID of the person requesting to join. */
	actorDid: /*#__PURE__*/ v.didString(),
	/** When the group was originally created. */
	convoCreatedAt: /*#__PURE__*/ v.datetimeString(),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Current member count at the time of the event. */
	groupMemberCount: /*#__PURE__*/ v.integer(),
	groupName: /*#__PURE__*/ v.string(),
	/** The code of the join link used to request joining. */
	joinLinkCode: /*#__PURE__*/ v.string(),
	/** The DID of the group chat owner. */
	ownerDid: /*#__PURE__*/ v.didString(),
	rev: /*#__PURE__*/ v.string(),
	/** Whether the requesting member follows the group owner. */
	subjectFollowsOwner: /*#__PURE__*/ v.boolean(),
});
const _eventGroupChatJoinRequestApprovedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventGroupChatJoinRequestApproved'),
	),
	/** The DID of the owner approving the request. */
	actorDid: /*#__PURE__*/ v.didString(),
	/** When the group was originally created. */
	convoCreatedAt: /*#__PURE__*/ v.datetimeString(),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Current member count at the time of the event. */
	groupMemberCount: /*#__PURE__*/ v.integer(),
	groupName: /*#__PURE__*/ v.string(),
	/** The DID of the group chat owner. */
	ownerDid: /*#__PURE__*/ v.didString(),
	rev: /*#__PURE__*/ v.string(),
	/** The DID of the member whose request was approved. */
	subjectDid: /*#__PURE__*/ v.didString(),
});
const _eventGroupChatJoinRequestRejectedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventGroupChatJoinRequestRejected'),
	),
	/** The DID of the owner rejecting the request. */
	actorDid: /*#__PURE__*/ v.didString(),
	/** When the group was originally created. */
	convoCreatedAt: /*#__PURE__*/ v.datetimeString(),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Current member count at the time of the event. */
	groupMemberCount: /*#__PURE__*/ v.integer(),
	groupName: /*#__PURE__*/ v.string(),
	/** The DID of the group chat owner. */
	ownerDid: /*#__PURE__*/ v.didString(),
	rev: /*#__PURE__*/ v.string(),
	/** The DID of the member whose request was rejected. */
	subjectDid: /*#__PURE__*/ v.didString(),
});
const _eventGroupChatMemberAddedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventGroupChatMemberAdded'),
	),
	/** The DID of the actor performing the action. For this event, same as ownerDid. */
	actorDid: /*#__PURE__*/ v.didString(),
	/** When the group was originally created. */
	convoCreatedAt: /*#__PURE__*/ v.datetimeString(),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Current member count at the time of the event. */
	groupMemberCount: /*#__PURE__*/ v.integer(),
	groupName: /*#__PURE__*/ v.string(),
	/** The DID of the group chat owner. */
	ownerDid: /*#__PURE__*/ v.didString(),
	/** The number of members who have not yet accepted the convo. */
	requestMembersCount: /*#__PURE__*/ v.integer(),
	rev: /*#__PURE__*/ v.string(),
	/** The DID of the member who was added. */
	subjectDid: /*#__PURE__*/ v.didString(),
	/** Whether the added member follows the group owner. */
	subjectFollowsOwner: /*#__PURE__*/ v.boolean(),
});
const _eventGroupChatMemberJoinedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventGroupChatMemberJoined'),
	),
	/** The DID of the person joining. */
	actorDid: /*#__PURE__*/ v.didString(),
	/** When the group was originally created. */
	convoCreatedAt: /*#__PURE__*/ v.datetimeString(),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Current member count at the time of the event. */
	groupMemberCount: /*#__PURE__*/ v.integer(),
	groupName: /*#__PURE__*/ v.string(),
	/** The code of the join link used to join. */
	joinLinkCode: /*#__PURE__*/ v.string(),
	/** The DID of the group chat owner. */
	ownerDid: /*#__PURE__*/ v.didString(),
	rev: /*#__PURE__*/ v.string(),
	/** Whether the joining member follows the group owner. */
	subjectFollowsOwner: /*#__PURE__*/ v.boolean(),
});
const _eventGroupChatMemberLeftSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventGroupChatMemberLeft'),
	),
	/** The DID of the actor. For voluntary: the person leaving. For kicked: the owner. */
	actorDid: /*#__PURE__*/ v.didString(),
	/** When the group was originally created. */
	convoCreatedAt: /*#__PURE__*/ v.datetimeString(),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Current member count at the time of the event. */
	groupMemberCount: /*#__PURE__*/ v.integer(),
	groupName: /*#__PURE__*/ v.string(),
	/** How the member left. */
	leaveMethod: /*#__PURE__*/ v.string<'kicked' | 'voluntary' | (string & {})>(),
	/** The DID of the group chat owner. */
	ownerDid: /*#__PURE__*/ v.didString(),
	rev: /*#__PURE__*/ v.string(),
	/** The DID of the member who left or was removed. */
	subjectDid: /*#__PURE__*/ v.didString(),
});
const _eventGroupChatUpdatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventGroupChatUpdated'),
	),
	/** The DID of the actor performing the action (the owner). */
	actorDid: /*#__PURE__*/ v.didString(),
	/** When the group was originally created. */
	convoCreatedAt: /*#__PURE__*/ v.datetimeString(),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Current member count at the time of the event. */
	groupMemberCount: /*#__PURE__*/ v.integer(),
	/** Current group name. */
	groupName: /*#__PURE__*/ v.string(),
	/** The code of the join link. Only present when updateType is join-link-related. */
	joinLinkCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Whether the join link is restricted to followers of the owner. Only present when updateType is
	 * join-link-related.
	 */
	joinLinkFollowersOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/** Whether the join link requires owner approval to join. Only present when updateType is join-link-related. */
	joinLinkRequiresApproval: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/** Why the group was locked. Only present when updateType is 'locked'. */
	lockReason: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			| 'label_applied'
			| 'owner_action'
			| 'owner_deactivated'
			| 'owner_deleted'
			| 'owner_left'
			| 'owner_suspended'
			| 'owner_taken_down'
			| (string & {})
		>(),
	),
	/** The new group name. Only present when updateType is 'name_changed'. */
	newName: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The previous group name. Only present when updateType is 'name_changed'. */
	oldName: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The DID of the group chat owner. */
	ownerDid: /*#__PURE__*/ v.didString(),
	rev: /*#__PURE__*/ v.string(),
	/** What changed. */
	updateType: /*#__PURE__*/ v.string<
		| 'join_link_created'
		| 'join_link_disabled'
		| 'join_link_settings_changed'
		| 'locked'
		| 'locked_permanently'
		| 'name_changed'
		| 'unlocked'
		| (string & {})
	>(),
});
const _eventRateLimitExceededSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventRateLimitExceeded'),
	),
	/** The DID of the user who hit the rate limit. */
	actorDid: /*#__PURE__*/ v.didString(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** The NSID of the endpoint that was rate limited. */
	endpoint: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.subscription('chat.bsky.moderation.subscribeModEvents', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The last known event seq number to backfill from. Use '2222222222222' to backfill from the beginning.
		 * Don't specify a cursor to listen only for new events.
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([
			eventChatAcceptedSchema,
			eventConvoFirstMessageSchema,
			eventGroupChatCreatedSchema,
			eventGroupChatJoinRequestSchema,
			eventGroupChatJoinRequestApprovedSchema,
			eventGroupChatJoinRequestRejectedSchema,
			eventGroupChatMemberAddedSchema,
			eventGroupChatMemberJoinedSchema,
			eventGroupChatMemberLeftSchema,
			eventGroupChatUpdatedSchema,
			eventRateLimitExceededSchema,
		]);
	},
});

type eventChatAccepted$schematype = typeof _eventChatAcceptedSchema;
type eventConvoFirstMessage$schematype = typeof _eventConvoFirstMessageSchema;
type eventGroupChatCreated$schematype = typeof _eventGroupChatCreatedSchema;
type eventGroupChatJoinRequest$schematype = typeof _eventGroupChatJoinRequestSchema;
type eventGroupChatJoinRequestApproved$schematype = typeof _eventGroupChatJoinRequestApprovedSchema;
type eventGroupChatJoinRequestRejected$schematype = typeof _eventGroupChatJoinRequestRejectedSchema;
type eventGroupChatMemberAdded$schematype = typeof _eventGroupChatMemberAddedSchema;
type eventGroupChatMemberJoined$schematype = typeof _eventGroupChatMemberJoinedSchema;
type eventGroupChatMemberLeft$schematype = typeof _eventGroupChatMemberLeftSchema;
type eventGroupChatUpdated$schematype = typeof _eventGroupChatUpdatedSchema;
type eventRateLimitExceeded$schematype = typeof _eventRateLimitExceededSchema;
type main$schematype = typeof _mainSchema;

export interface eventChatAcceptedSchema extends eventChatAccepted$schematype {}
export interface eventConvoFirstMessageSchema extends eventConvoFirstMessage$schematype {}
export interface eventGroupChatCreatedSchema extends eventGroupChatCreated$schematype {}
export interface eventGroupChatJoinRequestSchema extends eventGroupChatJoinRequest$schematype {}
export interface eventGroupChatJoinRequestApprovedSchema extends eventGroupChatJoinRequestApproved$schematype {}
export interface eventGroupChatJoinRequestRejectedSchema extends eventGroupChatJoinRequestRejected$schematype {}
export interface eventGroupChatMemberAddedSchema extends eventGroupChatMemberAdded$schematype {}
export interface eventGroupChatMemberJoinedSchema extends eventGroupChatMemberJoined$schematype {}
export interface eventGroupChatMemberLeftSchema extends eventGroupChatMemberLeft$schematype {}
export interface eventGroupChatUpdatedSchema extends eventGroupChatUpdated$schematype {}
export interface eventRateLimitExceededSchema extends eventRateLimitExceeded$schematype {}
export interface mainSchema extends main$schematype {}

export const eventChatAcceptedSchema = _eventChatAcceptedSchema as eventChatAcceptedSchema;
export const eventConvoFirstMessageSchema = _eventConvoFirstMessageSchema as eventConvoFirstMessageSchema;
export const eventGroupChatCreatedSchema = _eventGroupChatCreatedSchema as eventGroupChatCreatedSchema;
export const eventGroupChatJoinRequestSchema =
	_eventGroupChatJoinRequestSchema as eventGroupChatJoinRequestSchema;
export const eventGroupChatJoinRequestApprovedSchema =
	_eventGroupChatJoinRequestApprovedSchema as eventGroupChatJoinRequestApprovedSchema;
export const eventGroupChatJoinRequestRejectedSchema =
	_eventGroupChatJoinRequestRejectedSchema as eventGroupChatJoinRequestRejectedSchema;
export const eventGroupChatMemberAddedSchema =
	_eventGroupChatMemberAddedSchema as eventGroupChatMemberAddedSchema;
export const eventGroupChatMemberJoinedSchema =
	_eventGroupChatMemberJoinedSchema as eventGroupChatMemberJoinedSchema;
export const eventGroupChatMemberLeftSchema =
	_eventGroupChatMemberLeftSchema as eventGroupChatMemberLeftSchema;
export const eventGroupChatUpdatedSchema = _eventGroupChatUpdatedSchema as eventGroupChatUpdatedSchema;
export const eventRateLimitExceededSchema = _eventRateLimitExceededSchema as eventRateLimitExceededSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface EventChatAccepted extends v.InferInput<typeof eventChatAcceptedSchema> {}
export interface EventConvoFirstMessage extends v.InferInput<typeof eventConvoFirstMessageSchema> {}
export interface EventGroupChatCreated extends v.InferInput<typeof eventGroupChatCreatedSchema> {}
export interface EventGroupChatJoinRequest extends v.InferInput<typeof eventGroupChatJoinRequestSchema> {}
export interface EventGroupChatJoinRequestApproved extends v.InferInput<
	typeof eventGroupChatJoinRequestApprovedSchema
> {}
export interface EventGroupChatJoinRequestRejected extends v.InferInput<
	typeof eventGroupChatJoinRequestRejectedSchema
> {}
export interface EventGroupChatMemberAdded extends v.InferInput<typeof eventGroupChatMemberAddedSchema> {}
export interface EventGroupChatMemberJoined extends v.InferInput<typeof eventGroupChatMemberJoinedSchema> {}
export interface EventGroupChatMemberLeft extends v.InferInput<typeof eventGroupChatMemberLeftSchema> {}
export interface EventGroupChatUpdated extends v.InferInput<typeof eventGroupChatUpdatedSchema> {}
export interface EventRateLimitExceeded extends v.InferInput<typeof eventRateLimitExceededSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $message = v.InferInput<mainSchema['message']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'chat.bsky.moderation.subscribeModEvents': mainSchema;
	}
}
