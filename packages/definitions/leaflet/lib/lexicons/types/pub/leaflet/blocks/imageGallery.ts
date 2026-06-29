import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _aspectRatioSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.imageGallery#aspectRatio')),
	height: /*#__PURE__*/ v.integer(),
	width: /*#__PURE__*/ v.integer(),
});
const _imageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.imageGallery#image')),
	/** Alt text description of the image, for accessibility. */
	alt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get aspectRatio() {
		return aspectRatioSchema;
	},
	/**
	 * @accept image/*
	 * @maxSize 1000000
	 */
	image: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
		/*#__PURE__*/ v.blobSize(1000000),
		/*#__PURE__*/ v.blobAccept(['image/*']),
	]),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.imageGallery')),
	format: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'carousel' | 'grid' | 'strip' | (string & {})>()),
	/** Gap between images in pixels. */
	gap: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get images() {
		return /*#__PURE__*/ v.array(imageSchema);
	},
	/** Max width per image in grid view (px); drives how many columns fit. */
	maxWidth: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});

type aspectRatio$schematype = typeof _aspectRatioSchema;
type image$schematype = typeof _imageSchema;
type main$schematype = typeof _mainSchema;

export interface aspectRatioSchema extends aspectRatio$schematype {}
export interface imageSchema extends image$schematype {}
export interface mainSchema extends main$schematype {}

export const aspectRatioSchema = _aspectRatioSchema as aspectRatioSchema;
export const imageSchema = _imageSchema as imageSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface AspectRatio extends v.InferInput<typeof aspectRatioSchema> {}
export interface Image extends v.InferInput<typeof imageSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
