import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _boldSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#bold')),
});
const _byteSliceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#byteSlice')),
	byteEnd: /*#__PURE__*/ v.integer(),
	byteStart: /*#__PURE__*/ v.integer(),
});
const _highlightSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#highlight')),
});
const _italicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#italic')),
});
const _linkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet#link')),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.richtext.facet')),
	get features() {
		return /*#__PURE__*/ v.array(
			/*#__PURE__*/ v.variant([
				boldSchema,
				highlightSchema,
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

type bold$schematype = typeof _boldSchema;
type byteSlice$schematype = typeof _byteSliceSchema;
type highlight$schematype = typeof _highlightSchema;
type italic$schematype = typeof _italicSchema;
type link$schematype = typeof _linkSchema;
type main$schematype = typeof _mainSchema;
type strikethrough$schematype = typeof _strikethroughSchema;
type underline$schematype = typeof _underlineSchema;

export interface boldSchema extends bold$schematype {}
export interface byteSliceSchema extends byteSlice$schematype {}
export interface highlightSchema extends highlight$schematype {}
export interface italicSchema extends italic$schematype {}
export interface linkSchema extends link$schematype {}
export interface mainSchema extends main$schematype {}
export interface strikethroughSchema extends strikethrough$schematype {}
export interface underlineSchema extends underline$schematype {}

export const boldSchema = _boldSchema as boldSchema;
export const byteSliceSchema = _byteSliceSchema as byteSliceSchema;
export const highlightSchema = _highlightSchema as highlightSchema;
export const italicSchema = _italicSchema as italicSchema;
export const linkSchema = _linkSchema as linkSchema;
export const mainSchema = _mainSchema as mainSchema;
export const strikethroughSchema = _strikethroughSchema as strikethroughSchema;
export const underlineSchema = _underlineSchema as underlineSchema;

export interface Bold extends v.InferInput<typeof boldSchema> {}
export interface ByteSlice extends v.InferInput<typeof byteSliceSchema> {}
export interface Highlight extends v.InferInput<typeof highlightSchema> {}
export interface Italic extends v.InferInput<typeof italicSchema> {}
export interface Link extends v.InferInput<typeof linkSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Strikethrough extends v.InferInput<typeof strikethroughSchema> {}
export interface Underline extends v.InferInput<typeof underlineSchema> {}
