import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '../actor/defs.js';
import * as AppBskyEmbedExternal from './external.js';
import * as AppBskyEmbedImages from './images.js';
import * as AppBskyEmbedRecordWithMedia from './recordWithMedia.js';
import * as AppBskyEmbedVideo from './video.js';
import * as AppBskyFeedDefs from '../feed/defs.js';
import * as AppBskyGraphDefs from '../graph/defs.js';
import * as AppBskyLabelerDefs from '../labeler/defs.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.record')),
	get record() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.record#view')),
	get record() {
		return /*#__PURE__*/ v.variant([
			viewRecordSchema,
			viewNotFoundSchema,
			viewBlockedSchema,
			viewDetachedSchema,
			AppBskyFeedDefs.generatorViewSchema,
			AppBskyGraphDefs.listViewSchema,
			AppBskyLabelerDefs.labelerViewSchema,
			AppBskyGraphDefs.starterPackViewBasicSchema,
		]);
	},
});
const _viewBlockedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.record#viewBlocked')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	blocked: /*#__PURE__*/ v.literal(true),
	get author() {
		return AppBskyFeedDefs.blockedAuthorSchema;
	},
});
const _viewDetachedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.record#viewDetached')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	detached: /*#__PURE__*/ v.literal(true),
});
const _viewNotFoundSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.record#viewNotFound')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	notFound: /*#__PURE__*/ v.literal(true),
});
const _viewRecordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.record#viewRecord')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.cidString(),
	get author() {
		return AppBskyActorDefs.profileViewBasicSchema;
	},
	value: /*#__PURE__*/ v.unknown(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	replyCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	repostCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	likeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	quoteCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get embeds() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.variant([
					AppBskyEmbedImages.viewSchema,
					AppBskyEmbedVideo.viewSchema,
					AppBskyEmbedExternal.viewSchema,
					viewSchema,
					AppBskyEmbedRecordWithMedia.viewSchema,
				]),
			),
		);
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
});

type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;
type viewBlocked$schematype = typeof _viewBlockedSchema;
type viewDetached$schematype = typeof _viewDetachedSchema;
type viewNotFound$schematype = typeof _viewNotFoundSchema;
type viewRecord$schematype = typeof _viewRecordSchema;

export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}
export interface viewBlockedSchema extends viewBlocked$schematype {}
export interface viewDetachedSchema extends viewDetached$schematype {}
export interface viewNotFoundSchema extends viewNotFound$schematype {}
export interface viewRecordSchema extends viewRecord$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;
export const viewBlockedSchema = _viewBlockedSchema as viewBlockedSchema;
export const viewDetachedSchema = _viewDetachedSchema as viewDetachedSchema;
export const viewNotFoundSchema = _viewNotFoundSchema as viewNotFoundSchema;
export const viewRecordSchema = _viewRecordSchema as viewRecordSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
export interface ViewBlocked extends v.InferInput<typeof viewBlockedSchema> {}
export interface ViewDetached extends v.InferInput<typeof viewDetachedSchema> {}
export interface ViewNotFound extends v.InferInput<typeof viewNotFoundSchema> {}
export interface ViewRecord extends v.InferInput<typeof viewRecordSchema> {}
