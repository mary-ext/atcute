import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from '../actor/defs.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.notification.listNotifications', {
	params: /*#__PURE__*/ v.object({
		reasons: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		priority: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.string(),
	get author() {
		return AppBskyActorDefs.profileViewSchema;
	},
	reason: /*#__PURE__*/ v.string<
		| 'like'
		| 'repost'
		| 'follow'
		| 'mention'
		| 'reply'
		| 'quote'
		| 'starterpack-joined'
		| 'verified'
		| 'unverified'
		| (string & {})
	>(),
	reasonSubject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	record: /*#__PURE__*/ v.unknown(),
	isRead: /*#__PURE__*/ v.boolean(),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
});

type main$schematype = typeof _mainSchema;
type notification$schematype = typeof _notificationSchema;

export interface mainSchema extends main$schematype {}
export interface notificationSchema extends notification$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const notificationSchema = _notificationSchema as notificationSchema;

export interface Notification extends v.InferInput<typeof notificationSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.notification.listNotifications': mainSchema;
	}
}
