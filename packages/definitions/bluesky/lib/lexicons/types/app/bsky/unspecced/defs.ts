import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '../actor/defs.js';

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

type skeletonSearchActor$schematype = typeof _skeletonSearchActorSchema;
type skeletonSearchPost$schematype = typeof _skeletonSearchPostSchema;
type skeletonSearchStarterPack$schematype = typeof _skeletonSearchStarterPackSchema;
type skeletonTrend$schematype = typeof _skeletonTrendSchema;
type trendView$schematype = typeof _trendViewSchema;
type trendingTopic$schematype = typeof _trendingTopicSchema;

export interface skeletonSearchActorSchema extends skeletonSearchActor$schematype {}
export interface skeletonSearchPostSchema extends skeletonSearchPost$schematype {}
export interface skeletonSearchStarterPackSchema extends skeletonSearchStarterPack$schematype {}
export interface skeletonTrendSchema extends skeletonTrend$schematype {}
export interface trendViewSchema extends trendView$schematype {}
export interface trendingTopicSchema extends trendingTopic$schematype {}

export const skeletonSearchActorSchema = _skeletonSearchActorSchema as skeletonSearchActorSchema;
export const skeletonSearchPostSchema = _skeletonSearchPostSchema as skeletonSearchPostSchema;
export const skeletonSearchStarterPackSchema =
	_skeletonSearchStarterPackSchema as skeletonSearchStarterPackSchema;
export const skeletonTrendSchema = _skeletonTrendSchema as skeletonTrendSchema;
export const trendViewSchema = _trendViewSchema as trendViewSchema;
export const trendingTopicSchema = _trendingTopicSchema as trendingTopicSchema;

export interface SkeletonSearchActor extends v.InferInput<typeof skeletonSearchActorSchema> {}
export interface SkeletonSearchPost extends v.InferInput<typeof skeletonSearchPostSchema> {}
export interface SkeletonSearchStarterPack extends v.InferInput<typeof skeletonSearchStarterPackSchema> {}
export interface SkeletonTrend extends v.InferInput<typeof skeletonTrendSchema> {}
export interface TrendView extends v.InferInput<typeof trendViewSchema> {}
export interface TrendingTopic extends v.InferInput<typeof trendingTopicSchema> {}
