import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '../actor/defs.js';
import * as AppBskyFeedDefs from '../feed/defs.js';

const _ageAssuranceEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#ageAssuranceEvent')),
	/**
	 * The unique identifier for this instance of the age assurance flow, in UUID format.
	 */
	attemptId: /*#__PURE__*/ v.string(),
	/**
	 * The IP address used when completing the AA flow.
	 */
	completeIp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The user agent used when completing the AA flow.
	 */
	completeUa: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The date and time of this write operation.
	 */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/**
	 * The email used for AA.
	 */
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The IP address used when initiating the AA flow.
	 */
	initIp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The user agent used when initiating the AA flow.
	 */
	initUa: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The status of the age assurance process.
	 */
	status: /*#__PURE__*/ v.string<'assured' | 'pending' | 'unknown' | (string & {})>(),
});
const _ageAssuranceStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#ageAssuranceState')),
	/**
	 * The timestamp when this state was last updated.
	 */
	lastInitiatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * The status of the age assurance process.
	 */
	status: /*#__PURE__*/ v.string<'assured' | 'blocked' | 'pending' | 'unknown' | (string & {})>(),
});
const _skeletonSearchActorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#skeletonSearchActor')),
	did: /*#__PURE__*/ v.didString(),
});
const _skeletonSearchPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#skeletonSearchPost')),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _skeletonSearchStarterPackSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#skeletonSearchStarterPack'),
	),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _skeletonTrendSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#skeletonTrend')),
	category: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	dids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
	displayName: /*#__PURE__*/ v.string(),
	link: /*#__PURE__*/ v.string(),
	postCount: /*#__PURE__*/ v.integer(),
	startedAt: /*#__PURE__*/ v.datetimeString(),
	status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'hot' | (string & {})>()),
	topic: /*#__PURE__*/ v.string(),
});
const _threadItemBlockedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#threadItemBlocked')),
	get author() {
		return AppBskyFeedDefs.blockedAuthorSchema;
	},
});
const _threadItemNoUnauthenticatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#threadItemNoUnauthenticated'),
	),
});
const _threadItemNotFoundSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#threadItemNotFound')),
});
const _threadItemPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#threadItemPost')),
	/**
	 * The threadgate created by the author indicates this post as a reply to be hidden for everyone consuming the thread.
	 */
	hiddenByThreadgate: /*#__PURE__*/ v.boolean(),
	/**
	 * This post has more parents that were not present in the response. This is just a boolean, without the number of parents.
	 */
	moreParents: /*#__PURE__*/ v.boolean(),
	/**
	 * This post has more replies that were not present in the response. This is a numeric value, which is best-effort and might not be accurate.
	 */
	moreReplies: /*#__PURE__*/ v.integer(),
	/**
	 * This is by an account muted by the viewer requesting it.
	 */
	mutedByViewer: /*#__PURE__*/ v.boolean(),
	/**
	 * This post is part of a contiguous thread by the OP from the thread root. Many different OP threads can happen in the same thread.
	 */
	opThread: /*#__PURE__*/ v.boolean(),
	get post() {
		return AppBskyFeedDefs.postViewSchema;
	},
});
const _trendViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#trendView')),
	get actors() {
		return /*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema);
	},
	category: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	displayName: /*#__PURE__*/ v.string(),
	link: /*#__PURE__*/ v.string(),
	postCount: /*#__PURE__*/ v.integer(),
	startedAt: /*#__PURE__*/ v.datetimeString(),
	status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'hot' | (string & {})>()),
	topic: /*#__PURE__*/ v.string(),
});
const _trendingTopicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.defs#trendingTopic')),
	description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	displayName: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	link: /*#__PURE__*/ v.string(),
	topic: /*#__PURE__*/ v.string(),
});

type ageAssuranceEvent$schematype = typeof _ageAssuranceEventSchema;
type ageAssuranceState$schematype = typeof _ageAssuranceStateSchema;
type skeletonSearchActor$schematype = typeof _skeletonSearchActorSchema;
type skeletonSearchPost$schematype = typeof _skeletonSearchPostSchema;
type skeletonSearchStarterPack$schematype = typeof _skeletonSearchStarterPackSchema;
type skeletonTrend$schematype = typeof _skeletonTrendSchema;
type threadItemBlocked$schematype = typeof _threadItemBlockedSchema;
type threadItemNoUnauthenticated$schematype = typeof _threadItemNoUnauthenticatedSchema;
type threadItemNotFound$schematype = typeof _threadItemNotFoundSchema;
type threadItemPost$schematype = typeof _threadItemPostSchema;
type trendView$schematype = typeof _trendViewSchema;
type trendingTopic$schematype = typeof _trendingTopicSchema;

export interface ageAssuranceEventSchema extends ageAssuranceEvent$schematype {}
export interface ageAssuranceStateSchema extends ageAssuranceState$schematype {}
export interface skeletonSearchActorSchema extends skeletonSearchActor$schematype {}
export interface skeletonSearchPostSchema extends skeletonSearchPost$schematype {}
export interface skeletonSearchStarterPackSchema extends skeletonSearchStarterPack$schematype {}
export interface skeletonTrendSchema extends skeletonTrend$schematype {}
export interface threadItemBlockedSchema extends threadItemBlocked$schematype {}
export interface threadItemNoUnauthenticatedSchema extends threadItemNoUnauthenticated$schematype {}
export interface threadItemNotFoundSchema extends threadItemNotFound$schematype {}
export interface threadItemPostSchema extends threadItemPost$schematype {}
export interface trendViewSchema extends trendView$schematype {}
export interface trendingTopicSchema extends trendingTopic$schematype {}

export const ageAssuranceEventSchema = _ageAssuranceEventSchema as ageAssuranceEventSchema;
export const ageAssuranceStateSchema = _ageAssuranceStateSchema as ageAssuranceStateSchema;
export const skeletonSearchActorSchema = _skeletonSearchActorSchema as skeletonSearchActorSchema;
export const skeletonSearchPostSchema = _skeletonSearchPostSchema as skeletonSearchPostSchema;
export const skeletonSearchStarterPackSchema =
	_skeletonSearchStarterPackSchema as skeletonSearchStarterPackSchema;
export const skeletonTrendSchema = _skeletonTrendSchema as skeletonTrendSchema;
export const threadItemBlockedSchema = _threadItemBlockedSchema as threadItemBlockedSchema;
export const threadItemNoUnauthenticatedSchema =
	_threadItemNoUnauthenticatedSchema as threadItemNoUnauthenticatedSchema;
export const threadItemNotFoundSchema = _threadItemNotFoundSchema as threadItemNotFoundSchema;
export const threadItemPostSchema = _threadItemPostSchema as threadItemPostSchema;
export const trendViewSchema = _trendViewSchema as trendViewSchema;
export const trendingTopicSchema = _trendingTopicSchema as trendingTopicSchema;

export interface AgeAssuranceEvent extends v.InferInput<typeof ageAssuranceEventSchema> {}
export interface AgeAssuranceState extends v.InferInput<typeof ageAssuranceStateSchema> {}
export interface SkeletonSearchActor extends v.InferInput<typeof skeletonSearchActorSchema> {}
export interface SkeletonSearchPost extends v.InferInput<typeof skeletonSearchPostSchema> {}
export interface SkeletonSearchStarterPack extends v.InferInput<typeof skeletonSearchStarterPackSchema> {}
export interface SkeletonTrend extends v.InferInput<typeof skeletonTrendSchema> {}
export interface ThreadItemBlocked extends v.InferInput<typeof threadItemBlockedSchema> {}
export interface ThreadItemNoUnauthenticated extends v.InferInput<typeof threadItemNoUnauthenticatedSchema> {}
export interface ThreadItemNotFound extends v.InferInput<typeof threadItemNotFoundSchema> {}
export interface ThreadItemPost extends v.InferInput<typeof threadItemPostSchema> {}
export interface TrendView extends v.InferInput<typeof trendViewSchema> {}
export interface TrendingTopic extends v.InferInput<typeof trendingTopicSchema> {}
