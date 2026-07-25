import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _aspectRatioSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.html#aspectRatio')),
	height: /*#__PURE__*/ v.integer(),
	width: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.html')),
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(aspectRatioSchema);
	},
	/**
	 * @minimum 16
	 * @maximum 1600
	 */
	height: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(16, 1600)]),
	),
	/** Inline HTML rendered via a sandboxed iframe's srcdoc attribute. */
	html: /*#__PURE__*/ v.string(),
});

type aspectRatio$schematype = typeof _aspectRatioSchema;
type main$schematype = typeof _mainSchema;

export interface aspectRatioSchema extends aspectRatio$schematype {}
export interface mainSchema extends main$schematype {}

export const aspectRatioSchema = _aspectRatioSchema as aspectRatioSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface AspectRatio extends v.InferInput<typeof aspectRatioSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
