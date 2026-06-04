import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyEmbedDefs from './defs.ts';

const _imageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.gallery#image')),
	/** Alt text description of the image, for accessibility. */
	alt: /*#__PURE__*/ v.string(),
	get aspectRatio() {
		return AppBskyEmbedDefs.aspectRatioSchema;
	},
	/**
	 * @accept image/*
	 * @maxSize 2000000
	 */
	image: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
		/*#__PURE__*/ v.blobSize(2000000),
		/*#__PURE__*/ v.blobAccept(['image/*']),
	]),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.gallery')),
	/**
	 * The schema-level maxLength of 20 is a future-proof ceiling. Clients should currently enforce a soft limit
	 * of 10 items in authoring UIs.
	 *
	 * @maxLength 20
	 */
	get items() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([imageSchema])), [
			/*#__PURE__*/ v.arrayLength(0, 20),
		]);
	},
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.gallery#view')),
	get items() {
		return /*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([viewImageSchema]));
	},
});
const _viewImageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.gallery#viewImage')),
	/** Alt text description of the image, for accessibility. */
	alt: /*#__PURE__*/ v.string(),
	get aspectRatio() {
		return AppBskyEmbedDefs.aspectRatioSchema;
	},
	/**
	 * Fully-qualified URL where a large version of the image can be fetched. May or may not be the exact
	 * original blob. For example, CDN location provided by the App View.
	 */
	fullsize: /*#__PURE__*/ v.genericUriString(),
	/**
	 * Fully-qualified URL where a thumbnail of the image can be fetched. For example, CDN location provided by
	 * the App View.
	 */
	thumbnail: /*#__PURE__*/ v.genericUriString(),
});

type image$schematype = typeof _imageSchema;
type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;
type viewImage$schematype = typeof _viewImageSchema;

export interface imageSchema extends image$schematype {}
export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}
export interface viewImageSchema extends viewImage$schematype {}

export const imageSchema = _imageSchema as imageSchema;
export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;
export const viewImageSchema = _viewImageSchema as viewImageSchema;

export interface Image extends v.InferInput<typeof imageSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
export interface ViewImage extends v.InferInput<typeof viewImageSchema> {}
