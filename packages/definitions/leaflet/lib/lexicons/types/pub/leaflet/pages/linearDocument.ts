import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as PubLeafletBlocksBlockquote from '../blocks/blockquote.js';
import * as PubLeafletBlocksBskyPost from '../blocks/bskyPost.js';
import * as PubLeafletBlocksCode from '../blocks/code.js';
import * as PubLeafletBlocksHeader from '../blocks/header.js';
import * as PubLeafletBlocksHorizontalRule from '../blocks/horizontalRule.js';
import * as PubLeafletBlocksIframe from '../blocks/iframe.js';
import * as PubLeafletBlocksImage from '../blocks/image.js';
import * as PubLeafletBlocksMath from '../blocks/math.js';
import * as PubLeafletBlocksText from '../blocks/text.js';
import * as PubLeafletBlocksUnorderedList from '../blocks/unorderedList.js';
import * as PubLeafletBlocksWebsite from '../blocks/website.js';

const _blockSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#block')),
	alignment: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			'#textAlignCenter' | '#textAlignJustify' | '#textAlignLeft' | '#textAlignRight' | (string & {})
		>(),
	),
	get block() {
		return /*#__PURE__*/ v.variant([
			PubLeafletBlocksBlockquote.mainSchema,
			PubLeafletBlocksBskyPost.mainSchema,
			PubLeafletBlocksCode.mainSchema,
			PubLeafletBlocksHeader.mainSchema,
			PubLeafletBlocksHorizontalRule.mainSchema,
			PubLeafletBlocksIframe.mainSchema,
			PubLeafletBlocksImage.mainSchema,
			PubLeafletBlocksMath.mainSchema,
			PubLeafletBlocksText.mainSchema,
			PubLeafletBlocksUnorderedList.mainSchema,
			PubLeafletBlocksWebsite.mainSchema,
		]);
	},
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument')),
	get blocks() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(blockSchema));
	},
});
const _positionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#position')),
	block: /*#__PURE__*/ v.array(/*#__PURE__*/ v.integer()),
	offset: /*#__PURE__*/ v.integer(),
});
const _quoteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#quote')),
	get end() {
		return positionSchema;
	},
	get start() {
		return positionSchema;
	},
});
const _textAlignCenterSchema = /*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#textAlignCenter');
const _textAlignLeftSchema = /*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#textAlignLeft');
const _textAlignRightSchema = /*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#textAlignRight');

type block$schematype = typeof _blockSchema;
type main$schematype = typeof _mainSchema;
type position$schematype = typeof _positionSchema;
type quote$schematype = typeof _quoteSchema;
type textAlignCenter$schematype = typeof _textAlignCenterSchema;
type textAlignLeft$schematype = typeof _textAlignLeftSchema;
type textAlignRight$schematype = typeof _textAlignRightSchema;

export interface blockSchema extends block$schematype {}
export interface mainSchema extends main$schematype {}
export interface positionSchema extends position$schematype {}
export interface quoteSchema extends quote$schematype {}
export interface textAlignCenterSchema extends textAlignCenter$schematype {}
export interface textAlignLeftSchema extends textAlignLeft$schematype {}
export interface textAlignRightSchema extends textAlignRight$schematype {}

export const blockSchema = _blockSchema as blockSchema;
export const mainSchema = _mainSchema as mainSchema;
export const positionSchema = _positionSchema as positionSchema;
export const quoteSchema = _quoteSchema as quoteSchema;
export const textAlignCenterSchema = _textAlignCenterSchema as textAlignCenterSchema;
export const textAlignLeftSchema = _textAlignLeftSchema as textAlignLeftSchema;
export const textAlignRightSchema = _textAlignRightSchema as textAlignRightSchema;

export interface Block extends v.InferInput<typeof blockSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Position extends v.InferInput<typeof positionSchema> {}
export interface Quote extends v.InferInput<typeof quoteSchema> {}
export type TextAlignCenter = v.InferInput<typeof textAlignCenterSchema>;
export type TextAlignLeft = v.InferInput<typeof textAlignLeftSchema>;
export type TextAlignRight = v.InferInput<typeof textAlignRightSchema>;
