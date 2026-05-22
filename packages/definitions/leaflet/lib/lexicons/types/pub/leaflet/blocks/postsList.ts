import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.postsList')),
	filterByTag: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	highlightFirstPost: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	view: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'compact' | 'full' | (string & {})>()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
