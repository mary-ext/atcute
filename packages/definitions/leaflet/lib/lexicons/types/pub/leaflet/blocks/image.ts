import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _aspectRatioSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.image#aspectRatio')),
	height: /*#__PURE__*/ v.integer(),
	width: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.image')),
	/** Alt text description of the image, for accessibility. */
	alt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get aspectRatio() {
		return aspectRatioSchema;
	},
	/** Whether the image should extend to the full width of the container, ignoring padding. */
	fullBleed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * @accept image/*
	 * @maxSize 1000000
	 */
	image: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
		/*#__PURE__*/ v.blobSize(1000000),
		/*#__PURE__*/ v.blobAccept(['image/*']),
	]),
});

type aspectRatio$schematype = typeof _aspectRatioSchema;
type main$schematype = typeof _mainSchema;

export interface aspectRatioSchema extends aspectRatio$schematype {}
export interface mainSchema extends main$schematype {}

export const aspectRatioSchema = _aspectRatioSchema as aspectRatioSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface AspectRatio extends v.InferInput<typeof aspectRatioSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
