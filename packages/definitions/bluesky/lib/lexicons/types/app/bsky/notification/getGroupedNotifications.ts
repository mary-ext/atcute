import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyActorDefs from '../actor/defs.ts';
import * as AppBskyFeedDefs from '../feed/defs.ts';
import * as AppBskyGraphDefs from '../graph/defs.ts';

const _contactMatchNotificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#contactMatchNotification'),
	),
	actor: /*#__PURE__*/ v.didString(),
});
const _followBackNotificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#followBackNotification'),
	),
	actor: /*#__PURE__*/ v.didString(),
	starterPack: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
const _followGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#followGroup'),
	),
	/** @minLength 1 */
	get items() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(followItemSchema), [
			/*#__PURE__*/ v.arrayLength(1),
		]);
	},
});
const _followItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#followItem'),
	),
	actor: /*#__PURE__*/ v.didString(),
	starterPack: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
const _generatorLikeGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#generatorLikeGroup'),
	),
	generator: /*#__PURE__*/ v.resourceUriString(),
	/** @minLength 1 */
	get items() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(generatorLikeItemSchema), [
			/*#__PURE__*/ v.arrayLength(1),
		]);
	},
});
const _generatorLikeItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#generatorLikeItem'),
	),
	actor: /*#__PURE__*/ v.didString(),
});
const _groupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#group'),
	),
	/** @minimum 1 */
	count: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/** @maxLength 256 */
	id: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 256)]),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	isRead: /*#__PURE__*/ v.boolean(),
	get kind() {
		return /*#__PURE__*/ v.variant([
			contactMatchNotificationSchema,
			followBackNotificationSchema,
			followGroupSchema,
			generatorLikeGroupSchema,
			likeGroupSchema,
			likeViaRepostGroupSchema,
			mentionNotificationSchema,
			multiPostLikeGroupSchema,
			quoteNotificationSchema,
			replyNotificationSchema,
			repostGroupSchema,
			repostViaRepostGroupSchema,
			starterPackJoinedNotificationSchema,
			subscribedPostGroupSchema,
			unverifiedNotificationSchema,
			verifiedNotificationSchema,
		]);
	},
});
const _likeGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#likeGroup'),
	),
	/** @minLength 1 */
	get items() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(likeItemSchema), [/*#__PURE__*/ v.arrayLength(1)]);
	},
	post: /*#__PURE__*/ v.resourceUriString(),
});
const _likeItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#likeItem'),
	),
	actor: /*#__PURE__*/ v.didString(),
});
const _likeViaRepostGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#likeViaRepostGroup'),
	),
	/** @minLength 1 */
	get items() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(likeViaRepostItemSchema), [
			/*#__PURE__*/ v.arrayLength(1),
		]);
	},
	post: /*#__PURE__*/ v.resourceUriString(),
	viaRepost: /*#__PURE__*/ v.resourceUriString(),
});
const _likeViaRepostItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#likeViaRepostItem'),
	),
	actor: /*#__PURE__*/ v.didString(),
});
const _mainSchema = /*#__PURE__*/ v.query('app.bsky.notification.getGroupedNotifications', {
	params: /*#__PURE__*/ v.object({
		/** @maxLength 1024 */
		cursor: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1024)]),
		),
		/**
		 * Which notification feed to return. Grouping behavior varies by feed: notifications about follows might
		 * be grouped in 'all' and ungrouped (or rather, in single-item groups) in 'followers'.
		 *
		 * @default 'all'
		 * @maxLength 32
		 */
		feed: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.string<
					'activity' | 'all' | 'conversations' | 'followers' | 'people-i-follow' | (string & {})
				>(),
				[/*#__PURE__*/ v.stringLength(0, 32)],
			),
			'all',
		),
		/**
		 * Maximum number of groups to return.
		 *
		 * @default 30
		 * @minimum 1
		 * @maximum 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 50)]),
			30,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** @maxLength 1024 */
			cursor: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1024)]),
			),
			/**
			 * Notification groups or individual notifications, newest first. Clients should ignore kinds they do
			 * not recognize. Grouping behavior depends on the kind and selected feed.
			 */
			get groups() {
				return /*#__PURE__*/ v.array(groupSchema);
			},
			/**
			 * Reusable views referenced by notifications. Views shared across notifications appear once to avoid
			 * duplication. Each group contributes only its first 10 of each related view to this array. Ex: for a
			 * group containing likes in a post, we might have a large number of likeItem (e.g., 50) in a group, but
			 * only the profile views for the newest 10 items will be included here.
			 */
			get relatedViews() {
				return /*#__PURE__*/ v.optional(
					/*#__PURE__*/ v.array(
						/*#__PURE__*/ v.variant([
							AppBskyActorDefs.profileViewDetailedSchema,
							AppBskyFeedDefs.blockedPostSchema,
							AppBskyFeedDefs.generatorViewSchema,
							AppBskyFeedDefs.notFoundPostSchema,
							AppBskyFeedDefs.postViewSchema,
							AppBskyGraphDefs.starterPackViewSchema,
						]),
					),
				);
			},
			seenAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		}),
	},
});
const _mentionNotificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#mentionNotification'),
	),
	parent: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	post: /*#__PURE__*/ v.resourceUriString(),
});
const _multiPostLikeGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#multiPostLikeGroup'),
	),
	actor: /*#__PURE__*/ v.didString(),
	/** @minLength 2 */
	get items() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(multiPostLikeItemSchema), [
			/*#__PURE__*/ v.arrayLength(2),
		]);
	},
});
const _multiPostLikeItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#multiPostLikeItem'),
	),
	post: /*#__PURE__*/ v.resourceUriString(),
});
const _quoteNotificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#quoteNotification'),
	),
	parent: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	post: /*#__PURE__*/ v.resourceUriString(),
});
const _replyNotificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#replyNotification'),
	),
	parent: /*#__PURE__*/ v.resourceUriString(),
	post: /*#__PURE__*/ v.resourceUriString(),
});
const _repostGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#repostGroup'),
	),
	/** @minLength 1 */
	get items() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(repostItemSchema), [
			/*#__PURE__*/ v.arrayLength(1),
		]);
	},
	post: /*#__PURE__*/ v.resourceUriString(),
});
const _repostItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#repostItem'),
	),
	actor: /*#__PURE__*/ v.didString(),
});
const _repostViaRepostGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#repostViaRepostGroup'),
	),
	/** @minLength 1 */
	get items() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(repostViaRepostItemSchema), [
			/*#__PURE__*/ v.arrayLength(1),
		]);
	},
	post: /*#__PURE__*/ v.resourceUriString(),
	viaRepost: /*#__PURE__*/ v.resourceUriString(),
});
const _repostViaRepostItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#repostViaRepostItem'),
	),
	actor: /*#__PURE__*/ v.didString(),
});
const _starterPackJoinedNotificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#starterPackJoinedNotification'),
	),
	actor: /*#__PURE__*/ v.didString(),
	starterPack: /*#__PURE__*/ v.resourceUriString(),
});
const _subscribedPostGroupSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#subscribedPostGroup'),
	),
	/** @minLength 1 */
	get items() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(subscribedPostItemSchema), [
			/*#__PURE__*/ v.arrayLength(1),
		]);
	},
});
const _subscribedPostItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#subscribedPostItem'),
	),
	actor: /*#__PURE__*/ v.didString(),
	post: /*#__PURE__*/ v.resourceUriString(),
});
const _unverifiedNotificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#unverifiedNotification'),
	),
	actor: /*#__PURE__*/ v.didString(),
});
const _verifiedNotificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.getGroupedNotifications#verifiedNotification'),
	),
	actor: /*#__PURE__*/ v.didString(),
});

type contactMatchNotification$schematype = typeof _contactMatchNotificationSchema;
type followBackNotification$schematype = typeof _followBackNotificationSchema;
type followGroup$schematype = typeof _followGroupSchema;
type followItem$schematype = typeof _followItemSchema;
type generatorLikeGroup$schematype = typeof _generatorLikeGroupSchema;
type generatorLikeItem$schematype = typeof _generatorLikeItemSchema;
type group$schematype = typeof _groupSchema;
type likeGroup$schematype = typeof _likeGroupSchema;
type likeItem$schematype = typeof _likeItemSchema;
type likeViaRepostGroup$schematype = typeof _likeViaRepostGroupSchema;
type likeViaRepostItem$schematype = typeof _likeViaRepostItemSchema;
type main$schematype = typeof _mainSchema;
type mentionNotification$schematype = typeof _mentionNotificationSchema;
type multiPostLikeGroup$schematype = typeof _multiPostLikeGroupSchema;
type multiPostLikeItem$schematype = typeof _multiPostLikeItemSchema;
type quoteNotification$schematype = typeof _quoteNotificationSchema;
type replyNotification$schematype = typeof _replyNotificationSchema;
type repostGroup$schematype = typeof _repostGroupSchema;
type repostItem$schematype = typeof _repostItemSchema;
type repostViaRepostGroup$schematype = typeof _repostViaRepostGroupSchema;
type repostViaRepostItem$schematype = typeof _repostViaRepostItemSchema;
type starterPackJoinedNotification$schematype = typeof _starterPackJoinedNotificationSchema;
type subscribedPostGroup$schematype = typeof _subscribedPostGroupSchema;
type subscribedPostItem$schematype = typeof _subscribedPostItemSchema;
type unverifiedNotification$schematype = typeof _unverifiedNotificationSchema;
type verifiedNotification$schematype = typeof _verifiedNotificationSchema;

export interface contactMatchNotificationSchema extends contactMatchNotification$schematype {}
export interface followBackNotificationSchema extends followBackNotification$schematype {}
export interface followGroupSchema extends followGroup$schematype {}
export interface followItemSchema extends followItem$schematype {}
export interface generatorLikeGroupSchema extends generatorLikeGroup$schematype {}
export interface generatorLikeItemSchema extends generatorLikeItem$schematype {}
export interface groupSchema extends group$schematype {}
export interface likeGroupSchema extends likeGroup$schematype {}
export interface likeItemSchema extends likeItem$schematype {}
export interface likeViaRepostGroupSchema extends likeViaRepostGroup$schematype {}
export interface likeViaRepostItemSchema extends likeViaRepostItem$schematype {}
export interface mainSchema extends main$schematype {}
export interface mentionNotificationSchema extends mentionNotification$schematype {}
export interface multiPostLikeGroupSchema extends multiPostLikeGroup$schematype {}
export interface multiPostLikeItemSchema extends multiPostLikeItem$schematype {}
export interface quoteNotificationSchema extends quoteNotification$schematype {}
export interface replyNotificationSchema extends replyNotification$schematype {}
export interface repostGroupSchema extends repostGroup$schematype {}
export interface repostItemSchema extends repostItem$schematype {}
export interface repostViaRepostGroupSchema extends repostViaRepostGroup$schematype {}
export interface repostViaRepostItemSchema extends repostViaRepostItem$schematype {}
export interface starterPackJoinedNotificationSchema extends starterPackJoinedNotification$schematype {}
export interface subscribedPostGroupSchema extends subscribedPostGroup$schematype {}
export interface subscribedPostItemSchema extends subscribedPostItem$schematype {}
export interface unverifiedNotificationSchema extends unverifiedNotification$schematype {}
export interface verifiedNotificationSchema extends verifiedNotification$schematype {}

export const contactMatchNotificationSchema =
	_contactMatchNotificationSchema as contactMatchNotificationSchema;
export const followBackNotificationSchema = _followBackNotificationSchema as followBackNotificationSchema;
export const followGroupSchema = _followGroupSchema as followGroupSchema;
export const followItemSchema = _followItemSchema as followItemSchema;
export const generatorLikeGroupSchema = _generatorLikeGroupSchema as generatorLikeGroupSchema;
export const generatorLikeItemSchema = _generatorLikeItemSchema as generatorLikeItemSchema;
export const groupSchema = _groupSchema as groupSchema;
export const likeGroupSchema = _likeGroupSchema as likeGroupSchema;
export const likeItemSchema = _likeItemSchema as likeItemSchema;
export const likeViaRepostGroupSchema = _likeViaRepostGroupSchema as likeViaRepostGroupSchema;
export const likeViaRepostItemSchema = _likeViaRepostItemSchema as likeViaRepostItemSchema;
export const mainSchema = _mainSchema as mainSchema;
export const mentionNotificationSchema = _mentionNotificationSchema as mentionNotificationSchema;
export const multiPostLikeGroupSchema = _multiPostLikeGroupSchema as multiPostLikeGroupSchema;
export const multiPostLikeItemSchema = _multiPostLikeItemSchema as multiPostLikeItemSchema;
export const quoteNotificationSchema = _quoteNotificationSchema as quoteNotificationSchema;
export const replyNotificationSchema = _replyNotificationSchema as replyNotificationSchema;
export const repostGroupSchema = _repostGroupSchema as repostGroupSchema;
export const repostItemSchema = _repostItemSchema as repostItemSchema;
export const repostViaRepostGroupSchema = _repostViaRepostGroupSchema as repostViaRepostGroupSchema;
export const repostViaRepostItemSchema = _repostViaRepostItemSchema as repostViaRepostItemSchema;
export const starterPackJoinedNotificationSchema =
	_starterPackJoinedNotificationSchema as starterPackJoinedNotificationSchema;
export const subscribedPostGroupSchema = _subscribedPostGroupSchema as subscribedPostGroupSchema;
export const subscribedPostItemSchema = _subscribedPostItemSchema as subscribedPostItemSchema;
export const unverifiedNotificationSchema = _unverifiedNotificationSchema as unverifiedNotificationSchema;
export const verifiedNotificationSchema = _verifiedNotificationSchema as verifiedNotificationSchema;

export interface ContactMatchNotification extends v.InferInput<typeof contactMatchNotificationSchema> {}
export interface FollowBackNotification extends v.InferInput<typeof followBackNotificationSchema> {}
export interface FollowGroup extends v.InferInput<typeof followGroupSchema> {}
export interface FollowItem extends v.InferInput<typeof followItemSchema> {}
export interface GeneratorLikeGroup extends v.InferInput<typeof generatorLikeGroupSchema> {}
export interface GeneratorLikeItem extends v.InferInput<typeof generatorLikeItemSchema> {}
export interface Group extends v.InferInput<typeof groupSchema> {}
export interface LikeGroup extends v.InferInput<typeof likeGroupSchema> {}
export interface LikeItem extends v.InferInput<typeof likeItemSchema> {}
export interface LikeViaRepostGroup extends v.InferInput<typeof likeViaRepostGroupSchema> {}
export interface LikeViaRepostItem extends v.InferInput<typeof likeViaRepostItemSchema> {}
export interface MentionNotification extends v.InferInput<typeof mentionNotificationSchema> {}
export interface MultiPostLikeGroup extends v.InferInput<typeof multiPostLikeGroupSchema> {}
export interface MultiPostLikeItem extends v.InferInput<typeof multiPostLikeItemSchema> {}
export interface QuoteNotification extends v.InferInput<typeof quoteNotificationSchema> {}
export interface ReplyNotification extends v.InferInput<typeof replyNotificationSchema> {}
export interface RepostGroup extends v.InferInput<typeof repostGroupSchema> {}
export interface RepostItem extends v.InferInput<typeof repostItemSchema> {}
export interface RepostViaRepostGroup extends v.InferInput<typeof repostViaRepostGroupSchema> {}
export interface RepostViaRepostItem extends v.InferInput<typeof repostViaRepostItemSchema> {}
export interface StarterPackJoinedNotification extends v.InferInput<
	typeof starterPackJoinedNotificationSchema
> {}
export interface SubscribedPostGroup extends v.InferInput<typeof subscribedPostGroupSchema> {}
export interface SubscribedPostItem extends v.InferInput<typeof subscribedPostItemSchema> {}
export interface UnverifiedNotification extends v.InferInput<typeof unverifiedNotificationSchema> {}
export interface VerifiedNotification extends v.InferInput<typeof verifiedNotificationSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.notification.getGroupedNotifications': mainSchema;
	}
}
