import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from '../actor/defs.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.notification.listNotifications', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		priority: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Notification reasons to include in response.
		 */
		reasons: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		seenAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get notifications() {
				return /*#__PURE__*/ v.array(notificationSchema);
			},
			priority: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			seenAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		}),
	},
});
const _notificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.notification.listNotifications#notification'),
	),
	get author() {
		return AppBskyActorDefs.profileViewSchema;
	},
	cid: /*#__PURE__*/ v.cidString(),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	isRead: /*#__PURE__*/ v.boolean(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/**
	 * The reason why this notification was delivered - e.g. your post was liked, or you received a new follower.
	 */
	reason: /*#__PURE__*/ v.string<
		| 'follow'
		| 'like'
		| 'like-via-repost'
		| 'mention'
		| 'quote'
		| 'reply'
		| 'repost'
		| 'repost-via-repost'
		| 'starterpack-joined'
		| 'subscribed-post'
		| 'unverified'
		| 'verified'
		| (string & {})
	>(),
	reasonSubject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	record: /*#__PURE__*/ v.unknown(),
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type notification$schematype = typeof _notificationSchema;

export interface mainSchema extends main$schematype {}
export interface notificationSchema extends notification$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const notificationSchema = _notificationSchema as notificationSchema;

export interface Notification extends v.InferInput<typeof notificationSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.notification.listNotifications': mainSchema;
	}
}
