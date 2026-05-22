import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletThemeColor from '../theme/color.ts';

const _atMentionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#atMention')),
	atURI: /*#__PURE__*/ v.genericUriString(),
	href: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
});
const _boldSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#bold')),
});
const _byteSliceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#byteSlice')),
	/** @minimum 0 */
	byteEnd: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	byteStart: /*#__PURE__*/ v.integer(),
});
const _codeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#code')),
});
const _didMentionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#didMention')),
	did: /*#__PURE__*/ v.didString(),
});
const _footnoteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#footnote')),
	get contentFacets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(mainSchema));
	},
	contentPlaintext: /*#__PURE__*/ v.string(),
	footnoteId: /*#__PURE__*/ v.string(),
});
const _highlightSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#highlight')),
	get color() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([PubLeafletThemeColor.rgbSchema, PubLeafletThemeColor.rgbaSchema]),
		);
	},
});
const _idSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#id')),
	id: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _italicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#italic')),
});
const _linkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#link')),
	uri: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet')),
	get features() {
		return /*#__PURE__*/ v.array(
			/*#__PURE__*/ v.variant([
				atMentionSchema,
				boldSchema,
				codeSchema,
				didMentionSchema,
				footnoteSchema,
				highlightSchema,
				idSchema,
				italicSchema,
				linkSchema,
				strikethroughSchema,
				underlineSchema,
			]),
		);
	},
	get index() {
		return byteSliceSchema;
	},
});
const _strikethroughSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#strikethrough')),
});
const _underlineSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#underline')),
});

type atMention$schematype = typeof _atMentionSchema;
type bold$schematype = typeof _boldSchema;
type byteSlice$schematype = typeof _byteSliceSchema;
type code$schematype = typeof _codeSchema;
type didMention$schematype = typeof _didMentionSchema;
type footnote$schematype = typeof _footnoteSchema;
type highlight$schematype = typeof _highlightSchema;
type id$schematype = typeof _idSchema;
type italic$schematype = typeof _italicSchema;
type link$schematype = typeof _linkSchema;
type main$schematype = typeof _mainSchema;
type strikethrough$schematype = typeof _strikethroughSchema;
type underline$schematype = typeof _underlineSchema;

export interface atMentionSchema extends atMention$schematype {}
export interface boldSchema extends bold$schematype {}
export interface byteSliceSchema extends byteSlice$schematype {}
export interface codeSchema extends code$schematype {}
export interface didMentionSchema extends didMention$schematype {}
export interface footnoteSchema extends footnote$schematype {}
export interface highlightSchema extends highlight$schematype {}
export interface idSchema extends id$schematype {}
export interface italicSchema extends italic$schematype {}
export interface linkSchema extends link$schematype {}
export interface mainSchema extends main$schematype {}
export interface strikethroughSchema extends strikethrough$schematype {}
export interface underlineSchema extends underline$schematype {}

export const atMentionSchema = _atMentionSchema as atMentionSchema;
export const boldSchema = _boldSchema as boldSchema;
export const byteSliceSchema = _byteSliceSchema as byteSliceSchema;
export const codeSchema = _codeSchema as codeSchema;
export const didMentionSchema = _didMentionSchema as didMentionSchema;
export const footnoteSchema = _footnoteSchema as footnoteSchema;
export const highlightSchema = _highlightSchema as highlightSchema;
export const idSchema = _idSchema as idSchema;
export const italicSchema = _italicSchema as italicSchema;
export const linkSchema = _linkSchema as linkSchema;
export const mainSchema = _mainSchema as mainSchema;
export const strikethroughSchema = _strikethroughSchema as strikethroughSchema;
export const underlineSchema = _underlineSchema as underlineSchema;

export interface AtMention extends v.InferInput<typeof atMentionSchema> {}
export interface Bold extends v.InferInput<typeof boldSchema> {}
export interface ByteSlice extends v.InferInput<typeof byteSliceSchema> {}
export interface Code extends v.InferInput<typeof codeSchema> {}
export interface DidMention extends v.InferInput<typeof didMentionSchema> {}
export interface Footnote extends v.InferInput<typeof footnoteSchema> {}
export interface Highlight extends v.InferInput<typeof highlightSchema> {}
export interface Id extends v.InferInput<typeof idSchema> {}
export interface Italic extends v.InferInput<typeof italicSchema> {}
export interface Link extends v.InferInput<typeof linkSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Strikethrough extends v.InferInput<typeof strikethroughSchema> {}
export interface Underline extends v.InferInput<typeof underlineSchema> {}
