import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _aspectRatioSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.defs#aspectRatio')),
	/**
	 * @minimum 1
	 */
	height: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/**
	 * @minimum 1
	 */
	width: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});

type aspectRatio$schematype = typeof _aspectRatioSchema;

export interface aspectRatioSchema extends aspectRatio$schematype {}

export const aspectRatioSchema = _aspectRatioSchema as aspectRatioSchema;

export interface AspectRatio extends v.InferInput<typeof aspectRatioSchema> {}
