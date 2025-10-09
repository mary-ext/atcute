import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyEmbedExternal from '../embed/external.js';
import * as AppBskyEmbedImages from '../embed/images.js';
import * as AppBskyEmbedRecord from '../embed/record.js';
import * as AppBskyEmbedRecordWithMedia from '../embed/recordWithMedia.js';
import * as AppBskyEmbedVideo from '../embed/video.js';
import * as AppBskyRichtextFacet from '../richtext/facet.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';

const _entitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.post#entity')),
	get index() {
		return textSliceSchema;
	},
	/**
	 * Expected values are 'mention' and 'link'.
	 */
	type: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.feed.post'),
		/**
		 * Client-declared timestamp when this post was originally created.
		 */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get embed() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.variant([
					AppBskyEmbedExternal.mainSchema,
					AppBskyEmbedImages.mainSchema,
					AppBskyEmbedRecord.mainSchema,
					AppBskyEmbedRecordWithMedia.mainSchema,
					AppBskyEmbedVideo.mainSchema,
				]),
			);
		},
		/**
		 * DEPRECATED: replaced by app.bsky.richtext.facet.
		 * @deprecated
		 */
		get entities() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(entitySchema));
		},
		/**
		 * Annotations of text (mentions, URLs, hashtags, etc)
		 */
		get facets() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyRichtextFacet.mainSchema));
		},
		/**
		 * Self-label values for this post. Effectively content warnings.
		 */
		get labels() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]));
		},
		/**
		 * Indicates human language of post primary text content.
		 * @maxLength 3
		 */
		langs: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.languageCodeString()), [
				/*#__PURE__*/ v.arrayLength(0, 3),
			]),
		),
		get reply() {
			return /*#__PURE__*/ v.optional(replyRefSchema);
		},
		/**
		 * Additional hashtags, in addition to any included in post text and facets.
		 * @maxLength 8
		 */
		tags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
						/*#__PURE__*/ v.stringLength(0, 640),
						/*#__PURE__*/ v.stringGraphemes(0, 64),
					]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 8)],
			),
		),
		/**
		 * The primary post content. May be an empty string, if there are embeds.
		 * @maxLength 3000
		 * @maxGraphemes 300
		 */
		text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	}),
);
const _replyRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.post#replyRef')),
	get parent() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
	get root() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
});
const _textSliceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.post#textSlice')),
	/**
	 * @minimum 0
	 */
	end: /*#__PURE__*/ v.integer(),
	/**
	 * @minimum 0
	 */
	start: /*#__PURE__*/ v.integer(),
});

type entity$schematype = typeof _entitySchema;
type main$schematype = typeof _mainSchema;
type replyRef$schematype = typeof _replyRefSchema;
type textSlice$schematype = typeof _textSliceSchema;

export interface entitySchema extends entity$schematype {}
export interface mainSchema extends main$schematype {}
export interface replyRefSchema extends replyRef$schematype {}
export interface textSliceSchema extends textSlice$schematype {}

export const entitySchema = _entitySchema as entitySchema;
export const mainSchema = _mainSchema as mainSchema;
export const replyRefSchema = _replyRefSchema as replyRefSchema;
export const textSliceSchema = _textSliceSchema as textSliceSchema;

export interface Entity extends v.InferInput<typeof entitySchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface ReplyRef extends v.InferInput<typeof replyRefSchema> {}
export interface TextSlice extends v.InferInput<typeof textSliceSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.feed.post': mainSchema;
	}
}
