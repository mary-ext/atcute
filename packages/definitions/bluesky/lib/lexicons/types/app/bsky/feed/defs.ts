import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '../actor/defs.js';
import * as AppBskyEmbedExternal from '../embed/external.js';
import * as AppBskyEmbedImages from '../embed/images.js';
import * as AppBskyEmbedRecord from '../embed/record.js';
import * as AppBskyEmbedRecordWithMedia from '../embed/recordWithMedia.js';
import * as AppBskyEmbedVideo from '../embed/video.js';
import * as AppBskyGraphDefs from '../graph/defs.js';
import * as AppBskyRichtextFacet from '../richtext/facet.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _blockedAuthorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#blockedAuthor')),
	did: /*#__PURE__*/ v.didString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(AppBskyActorDefs.viewerStateSchema);
	},
});
const _blockedPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#blockedPost')),
	get author() {
		return blockedAuthorSchema;
	},
	blocked: /*#__PURE__*/ v.literal(true),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _clickthroughAuthorSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#clickthroughAuthor');
const _clickthroughEmbedSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#clickthroughEmbed');
const _clickthroughItemSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#clickthroughItem');
const _clickthroughReposterSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#clickthroughReposter');
const _contentModeUnspecifiedSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#contentModeUnspecified');
const _contentModeVideoSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#contentModeVideo');
const _feedViewPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#feedViewPost')),
	/**
	 * Context provided by feed generator that may be passed back alongside interactions.
	 * @maxLength 2000
	 */
	feedContext: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 2000)]),
	),
	get post() {
		return postViewSchema;
	},
	get reason() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([reasonPinSchema, reasonRepostSchema]));
	},
	get reply() {
		return /*#__PURE__*/ v.optional(replyRefSchema);
	},
	/**
	 * Unique identifier per request that may be passed back alongside interactions.
	 * @maxLength 100
	 */
	reqId: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	),
});
const _generatorViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#generatorView')),
	acceptsInteractions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	cid: /*#__PURE__*/ v.cidString(),
	contentMode: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			'app.bsky.feed.defs#contentModeUnspecified' | 'app.bsky.feed.defs#contentModeVideo' | (string & {})
		>(),
	),
	get creator() {
		return AppBskyActorDefs.profileViewSchema;
	},
	/**
	 * @maxLength 3000
	 * @maxGraphemes 300
	 */
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	),
	get descriptionFacets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyRichtextFacet.mainSchema));
	},
	did: /*#__PURE__*/ v.didString(),
	displayName: /*#__PURE__*/ v.string(),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/**
	 * @minimum 0
	 */
	likeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	uri: /*#__PURE__*/ v.resourceUriString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(generatorViewerStateSchema);
	},
});
const _generatorViewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#generatorViewerState')),
	like: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
const _interactionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#interaction')),
	event: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			| 'app.bsky.feed.defs#clickthroughAuthor'
			| 'app.bsky.feed.defs#clickthroughEmbed'
			| 'app.bsky.feed.defs#clickthroughItem'
			| 'app.bsky.feed.defs#clickthroughReposter'
			| 'app.bsky.feed.defs#interactionLike'
			| 'app.bsky.feed.defs#interactionQuote'
			| 'app.bsky.feed.defs#interactionReply'
			| 'app.bsky.feed.defs#interactionRepost'
			| 'app.bsky.feed.defs#interactionSeen'
			| 'app.bsky.feed.defs#interactionShare'
			| 'app.bsky.feed.defs#requestLess'
			| 'app.bsky.feed.defs#requestMore'
			| (string & {})
		>(),
	),
	/**
	 * Context on a feed item that was originally supplied by the feed generator on getFeedSkeleton.
	 * @maxLength 2000
	 */
	feedContext: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 2000)]),
	),
	item: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	/**
	 * Unique identifier per request that may be passed back alongside interactions.
	 * @maxLength 100
	 */
	reqId: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	),
});
const _interactionLikeSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#interactionLike');
const _interactionQuoteSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#interactionQuote');
const _interactionReplySchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#interactionReply');
const _interactionRepostSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#interactionRepost');
const _interactionSeenSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#interactionSeen');
const _interactionShareSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#interactionShare');
const _notFoundPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#notFoundPost')),
	notFound: /*#__PURE__*/ v.literal(true),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _postViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#postView')),
	get author() {
		return AppBskyActorDefs.profileViewBasicSchema;
	},
	bookmarkCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	cid: /*#__PURE__*/ v.cidString(),
	get embed() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([
				AppBskyEmbedExternal.viewSchema,
				AppBskyEmbedImages.viewSchema,
				AppBskyEmbedRecord.viewSchema,
				AppBskyEmbedRecordWithMedia.viewSchema,
				AppBskyEmbedVideo.viewSchema,
			]),
		);
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	likeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	quoteCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	record: /*#__PURE__*/ v.unknown(),
	replyCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	repostCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get threadgate() {
		return /*#__PURE__*/ v.optional(threadgateViewSchema);
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
});
const _reasonPinSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#reasonPin')),
});
const _reasonRepostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#reasonRepost')),
	get by() {
		return AppBskyActorDefs.profileViewBasicSchema;
	},
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	uri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
const _replyRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#replyRef')),
	/**
	 * When parent is a reply to another post, this is the author of that post.
	 */
	get grandparentAuthor() {
		return /*#__PURE__*/ v.optional(AppBskyActorDefs.profileViewBasicSchema);
	},
	get parent() {
		return /*#__PURE__*/ v.variant([blockedPostSchema, notFoundPostSchema, postViewSchema]);
	},
	get root() {
		return /*#__PURE__*/ v.variant([blockedPostSchema, notFoundPostSchema, postViewSchema]);
	},
});
const _requestLessSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#requestLess');
const _requestMoreSchema = /*#__PURE__*/ v.literal('app.bsky.feed.defs#requestMore');
const _skeletonFeedPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#skeletonFeedPost')),
	/**
	 * Context that will be passed through to client and may be passed to feed generator back alongside interactions.
	 * @maxLength 2000
	 */
	feedContext: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 2000)]),
	),
	post: /*#__PURE__*/ v.resourceUriString(),
	get reason() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([skeletonReasonPinSchema, skeletonReasonRepostSchema]),
		);
	},
});
const _skeletonReasonPinSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#skeletonReasonPin')),
});
const _skeletonReasonRepostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#skeletonReasonRepost')),
	repost: /*#__PURE__*/ v.resourceUriString(),
});
const _threadContextSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#threadContext')),
	rootAuthorLike: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
const _threadViewPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#threadViewPost')),
	get parent() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([blockedPostSchema, notFoundPostSchema, threadViewPostSchema]),
		);
	},
	get post() {
		return postViewSchema;
	},
	get replies() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.variant([blockedPostSchema, notFoundPostSchema, threadViewPostSchema]),
			),
		);
	},
	get threadContext() {
		return /*#__PURE__*/ v.optional(threadContextSchema);
	},
});
const _threadgateViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#threadgateView')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	get lists() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyGraphDefs.listViewBasicSchema));
	},
	record: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
	uri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
const _viewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.defs#viewerState')),
	bookmarked: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	embeddingDisabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	like: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	pinned: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	replyDisabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	repost: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	threadMuted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});

type blockedAuthor$schematype = typeof _blockedAuthorSchema;
type blockedPost$schematype = typeof _blockedPostSchema;
type clickthroughAuthor$schematype = typeof _clickthroughAuthorSchema;
type clickthroughEmbed$schematype = typeof _clickthroughEmbedSchema;
type clickthroughItem$schematype = typeof _clickthroughItemSchema;
type clickthroughReposter$schematype = typeof _clickthroughReposterSchema;
type contentModeUnspecified$schematype = typeof _contentModeUnspecifiedSchema;
type contentModeVideo$schematype = typeof _contentModeVideoSchema;
type feedViewPost$schematype = typeof _feedViewPostSchema;
type generatorView$schematype = typeof _generatorViewSchema;
type generatorViewerState$schematype = typeof _generatorViewerStateSchema;
type interaction$schematype = typeof _interactionSchema;
type interactionLike$schematype = typeof _interactionLikeSchema;
type interactionQuote$schematype = typeof _interactionQuoteSchema;
type interactionReply$schematype = typeof _interactionReplySchema;
type interactionRepost$schematype = typeof _interactionRepostSchema;
type interactionSeen$schematype = typeof _interactionSeenSchema;
type interactionShare$schematype = typeof _interactionShareSchema;
type notFoundPost$schematype = typeof _notFoundPostSchema;
type postView$schematype = typeof _postViewSchema;
type reasonPin$schematype = typeof _reasonPinSchema;
type reasonRepost$schematype = typeof _reasonRepostSchema;
type replyRef$schematype = typeof _replyRefSchema;
type requestLess$schematype = typeof _requestLessSchema;
type requestMore$schematype = typeof _requestMoreSchema;
type skeletonFeedPost$schematype = typeof _skeletonFeedPostSchema;
type skeletonReasonPin$schematype = typeof _skeletonReasonPinSchema;
type skeletonReasonRepost$schematype = typeof _skeletonReasonRepostSchema;
type threadContext$schematype = typeof _threadContextSchema;
type threadViewPost$schematype = typeof _threadViewPostSchema;
type threadgateView$schematype = typeof _threadgateViewSchema;
type viewerState$schematype = typeof _viewerStateSchema;

export interface blockedAuthorSchema extends blockedAuthor$schematype {}
export interface blockedPostSchema extends blockedPost$schematype {}
export interface clickthroughAuthorSchema extends clickthroughAuthor$schematype {}
export interface clickthroughEmbedSchema extends clickthroughEmbed$schematype {}
export interface clickthroughItemSchema extends clickthroughItem$schematype {}
export interface clickthroughReposterSchema extends clickthroughReposter$schematype {}
export interface contentModeUnspecifiedSchema extends contentModeUnspecified$schematype {}
export interface contentModeVideoSchema extends contentModeVideo$schematype {}
export interface feedViewPostSchema extends feedViewPost$schematype {}
export interface generatorViewSchema extends generatorView$schematype {}
export interface generatorViewerStateSchema extends generatorViewerState$schematype {}
export interface interactionSchema extends interaction$schematype {}
export interface interactionLikeSchema extends interactionLike$schematype {}
export interface interactionQuoteSchema extends interactionQuote$schematype {}
export interface interactionReplySchema extends interactionReply$schematype {}
export interface interactionRepostSchema extends interactionRepost$schematype {}
export interface interactionSeenSchema extends interactionSeen$schematype {}
export interface interactionShareSchema extends interactionShare$schematype {}
export interface notFoundPostSchema extends notFoundPost$schematype {}
export interface postViewSchema extends postView$schematype {}
export interface reasonPinSchema extends reasonPin$schematype {}
export interface reasonRepostSchema extends reasonRepost$schematype {}
export interface replyRefSchema extends replyRef$schematype {}
export interface requestLessSchema extends requestLess$schematype {}
export interface requestMoreSchema extends requestMore$schematype {}
export interface skeletonFeedPostSchema extends skeletonFeedPost$schematype {}
export interface skeletonReasonPinSchema extends skeletonReasonPin$schematype {}
export interface skeletonReasonRepostSchema extends skeletonReasonRepost$schematype {}
export interface threadContextSchema extends threadContext$schematype {}
export interface threadViewPostSchema extends threadViewPost$schematype {}
export interface threadgateViewSchema extends threadgateView$schematype {}
export interface viewerStateSchema extends viewerState$schematype {}

export const blockedAuthorSchema = _blockedAuthorSchema as blockedAuthorSchema;
export const blockedPostSchema = _blockedPostSchema as blockedPostSchema;
export const clickthroughAuthorSchema = _clickthroughAuthorSchema as clickthroughAuthorSchema;
export const clickthroughEmbedSchema = _clickthroughEmbedSchema as clickthroughEmbedSchema;
export const clickthroughItemSchema = _clickthroughItemSchema as clickthroughItemSchema;
export const clickthroughReposterSchema = _clickthroughReposterSchema as clickthroughReposterSchema;
export const contentModeUnspecifiedSchema = _contentModeUnspecifiedSchema as contentModeUnspecifiedSchema;
export const contentModeVideoSchema = _contentModeVideoSchema as contentModeVideoSchema;
export const feedViewPostSchema = _feedViewPostSchema as feedViewPostSchema;
export const generatorViewSchema = _generatorViewSchema as generatorViewSchema;
export const generatorViewerStateSchema = _generatorViewerStateSchema as generatorViewerStateSchema;
export const interactionSchema = _interactionSchema as interactionSchema;
export const interactionLikeSchema = _interactionLikeSchema as interactionLikeSchema;
export const interactionQuoteSchema = _interactionQuoteSchema as interactionQuoteSchema;
export const interactionReplySchema = _interactionReplySchema as interactionReplySchema;
export const interactionRepostSchema = _interactionRepostSchema as interactionRepostSchema;
export const interactionSeenSchema = _interactionSeenSchema as interactionSeenSchema;
export const interactionShareSchema = _interactionShareSchema as interactionShareSchema;
export const notFoundPostSchema = _notFoundPostSchema as notFoundPostSchema;
export const postViewSchema = _postViewSchema as postViewSchema;
export const reasonPinSchema = _reasonPinSchema as reasonPinSchema;
export const reasonRepostSchema = _reasonRepostSchema as reasonRepostSchema;
export const replyRefSchema = _replyRefSchema as replyRefSchema;
export const requestLessSchema = _requestLessSchema as requestLessSchema;
export const requestMoreSchema = _requestMoreSchema as requestMoreSchema;
export const skeletonFeedPostSchema = _skeletonFeedPostSchema as skeletonFeedPostSchema;
export const skeletonReasonPinSchema = _skeletonReasonPinSchema as skeletonReasonPinSchema;
export const skeletonReasonRepostSchema = _skeletonReasonRepostSchema as skeletonReasonRepostSchema;
export const threadContextSchema = _threadContextSchema as threadContextSchema;
export const threadViewPostSchema = _threadViewPostSchema as threadViewPostSchema;
export const threadgateViewSchema = _threadgateViewSchema as threadgateViewSchema;
export const viewerStateSchema = _viewerStateSchema as viewerStateSchema;

export interface BlockedAuthor extends v.InferInput<typeof blockedAuthorSchema> {}
export interface BlockedPost extends v.InferInput<typeof blockedPostSchema> {}
export type ClickthroughAuthor = v.InferInput<typeof clickthroughAuthorSchema>;
export type ClickthroughEmbed = v.InferInput<typeof clickthroughEmbedSchema>;
export type ClickthroughItem = v.InferInput<typeof clickthroughItemSchema>;
export type ClickthroughReposter = v.InferInput<typeof clickthroughReposterSchema>;
export type ContentModeUnspecified = v.InferInput<typeof contentModeUnspecifiedSchema>;
export type ContentModeVideo = v.InferInput<typeof contentModeVideoSchema>;
export interface FeedViewPost extends v.InferInput<typeof feedViewPostSchema> {}
export interface GeneratorView extends v.InferInput<typeof generatorViewSchema> {}
export interface GeneratorViewerState extends v.InferInput<typeof generatorViewerStateSchema> {}
export interface Interaction extends v.InferInput<typeof interactionSchema> {}
export type InteractionLike = v.InferInput<typeof interactionLikeSchema>;
export type InteractionQuote = v.InferInput<typeof interactionQuoteSchema>;
export type InteractionReply = v.InferInput<typeof interactionReplySchema>;
export type InteractionRepost = v.InferInput<typeof interactionRepostSchema>;
export type InteractionSeen = v.InferInput<typeof interactionSeenSchema>;
export type InteractionShare = v.InferInput<typeof interactionShareSchema>;
export interface NotFoundPost extends v.InferInput<typeof notFoundPostSchema> {}
export interface PostView extends v.InferInput<typeof postViewSchema> {}
export interface ReasonPin extends v.InferInput<typeof reasonPinSchema> {}
export interface ReasonRepost extends v.InferInput<typeof reasonRepostSchema> {}
export interface ReplyRef extends v.InferInput<typeof replyRefSchema> {}
export type RequestLess = v.InferInput<typeof requestLessSchema>;
export type RequestMore = v.InferInput<typeof requestMoreSchema>;
export interface SkeletonFeedPost extends v.InferInput<typeof skeletonFeedPostSchema> {}
export interface SkeletonReasonPin extends v.InferInput<typeof skeletonReasonPinSchema> {}
export interface SkeletonReasonRepost extends v.InferInput<typeof skeletonReasonRepostSchema> {}
export interface ThreadContext extends v.InferInput<typeof threadContextSchema> {}
export interface ThreadViewPost extends v.InferInput<typeof threadViewPostSchema> {}
export interface ThreadgateView extends v.InferInput<typeof threadgateViewSchema> {}
export interface ViewerState extends v.InferInput<typeof viewerStateSchema> {}
