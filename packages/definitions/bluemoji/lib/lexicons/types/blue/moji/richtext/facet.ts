import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _formats_v0Schema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.richtext.facet#formats_v0')),
	apng_128: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	gif_128: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	lottie: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	png_128: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	webp_128: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.richtext.facet')),
	adultOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	alt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	did: /*#__PURE__*/ v.string(),
	get formats() {
		return /*#__PURE__*/ v.variant([formats_v0Schema]);
	},
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]));
	},
	name: /*#__PURE__*/ v.string(),
});

type formats_v0$schematype = typeof _formats_v0Schema;
type main$schematype = typeof _mainSchema;

export interface formats_v0Schema extends formats_v0$schematype {}
export interface mainSchema extends main$schematype {}

export const formats_v0Schema = _formats_v0Schema as formats_v0Schema;
export const mainSchema = _mainSchema as mainSchema;

export interface Formats_v0 extends v.InferInput<typeof formats_v0Schema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
