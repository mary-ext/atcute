import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _aspectRatioSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.image#aspectRatio')),
	height: /*#__PURE__*/ v.integer(),
	width: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.image')),
	alt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get aspectRatio() {
		return aspectRatioSchema;
	},
	image: /*#__PURE__*/ v.blob(),
});

type aspectRatio$schematype = typeof _aspectRatioSchema;
type main$schematype = typeof _mainSchema;

export interface aspectRatioSchema extends aspectRatio$schematype {}
export interface mainSchema extends main$schematype {}

export const aspectRatioSchema = _aspectRatioSchema as aspectRatioSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface AspectRatio extends v.InferInput<typeof aspectRatioSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
