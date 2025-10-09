import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.theme.backgroundImage')),
	/**
	 * @accept image/*
	 * @maxSize 1000000
	 */
	image: /*#__PURE__*/ v.blob(),
	repeat: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	width: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
