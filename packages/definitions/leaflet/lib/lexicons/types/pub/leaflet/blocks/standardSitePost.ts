import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.standardSitePost')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	size: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'large' | 'medium' | 'small' | (string & {})>()),
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
