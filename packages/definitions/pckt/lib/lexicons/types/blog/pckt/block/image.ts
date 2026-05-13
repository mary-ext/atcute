import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _aspectRatioSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.image#aspectRatio')),
	/**
	 * Height component of aspect ratio
	 *
	 * @minimum 1
	 */
	height: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/**
	 * Width component of aspect ratio
	 *
	 * @minimum 1
	 */
	width: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});
const _imageAttrsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.image#imageAttrs')),
	/** Horizontal alignment of the image within its container */
	align: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['center', 'left', 'right'])),
	/**
	 * Alternative text description for accessibility and screen readers
	 *
	 * @maxLength 1000
	 * @maxGraphemes 300
	 */
	alt: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 1000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	),
	/** Image aspect ratio for proper layout before loading */
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(aspectRatioSchema);
	},
	/**
	 * AT Protocol blob reference (10MB max). Used when image is uploaded to PDS.
	 *
	 * @accept image/*
	 * @maxSize 10000000
	 */
	blob: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
			/*#__PURE__*/ v.blobSize(10000000),
			/*#__PURE__*/ v.blobAccept(['image/*']),
		]),
	),
	/**
	 * Image source URL or blob reference (blob:CID format for AT Protocol blobs)
	 *
	 * @maxLength 2000
	 */
	src: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 2000)]),
	/**
	 * Optional image title displayed on hover
	 *
	 * @maxLength 500
	 * @maxGraphemes 200
	 */
	title: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 500),
			/*#__PURE__*/ v.stringGraphemes(0, 200),
		]),
	),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.image')),
	/** Image attributes */
	get attrs() {
		return imageAttrsSchema;
	},
});

type aspectRatio$schematype = typeof _aspectRatioSchema;
type imageAttrs$schematype = typeof _imageAttrsSchema;
type main$schematype = typeof _mainSchema;

export interface aspectRatioSchema extends aspectRatio$schematype {}
export interface imageAttrsSchema extends imageAttrs$schematype {}
export interface mainSchema extends main$schematype {}

export const aspectRatioSchema = _aspectRatioSchema as aspectRatioSchema;
export const imageAttrsSchema = _imageAttrsSchema as imageAttrsSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface AspectRatio extends v.InferInput<typeof aspectRatioSchema> {}
export interface ImageAttrs extends v.InferInput<typeof imageAttrsSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
