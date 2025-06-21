import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.website')),
	description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	previewImage: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
	src: /*#__PURE__*/ v.genericUriString(),
	title: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
