import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as PubLeafletBlocksCode from '../blocks/code.js';
import * as PubLeafletBlocksHeader from '../blocks/header.js';
import * as PubLeafletBlocksImage from '../blocks/image.js';
import * as PubLeafletBlocksMath from '../blocks/math.js';
import * as PubLeafletBlocksText from '../blocks/text.js';
import * as PubLeafletBlocksUnorderedList from '../blocks/unorderedList.js';
import * as PubLeafletBlocksWebsite from '../blocks/website.js';

const _blockSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#block')),
	alignment: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'#textAlignCenter' | '#textAlignLeft' | '#textAlignRight' | (string & {})>(),
	),
	get block() {
		return /*#__PURE__*/ v.variant([
			PubLeafletBlocksCode.mainSchema,
			PubLeafletBlocksHeader.mainSchema,
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
const _textAlignCenterSchema = /*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#textAlignCenter');
const _textAlignLeftSchema = /*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#textAlignLeft');
const _textAlignRightSchema = /*#__PURE__*/ v.literal('pub.leaflet.pages.linearDocument#textAlignRight');

type block$schematype = typeof _blockSchema;
type main$schematype = typeof _mainSchema;
type textAlignCenter$schematype = typeof _textAlignCenterSchema;
type textAlignLeft$schematype = typeof _textAlignLeftSchema;
type textAlignRight$schematype = typeof _textAlignRightSchema;

export interface blockSchema extends block$schematype {}
export interface mainSchema extends main$schematype {}
export interface textAlignCenterSchema extends textAlignCenter$schematype {}
export interface textAlignLeftSchema extends textAlignLeft$schematype {}
export interface textAlignRightSchema extends textAlignRight$schematype {}

export const blockSchema = _blockSchema as blockSchema;
export const mainSchema = _mainSchema as mainSchema;
export const textAlignCenterSchema = _textAlignCenterSchema as textAlignCenterSchema;
export const textAlignLeftSchema = _textAlignLeftSchema as textAlignLeftSchema;
export const textAlignRightSchema = _textAlignRightSchema as textAlignRightSchema;

export interface Block extends v.InferInput<typeof blockSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export type TextAlignCenter = v.InferInput<typeof textAlignCenterSchema>;
export type TextAlignLeft = v.InferInput<typeof textAlignLeftSchema>;
export type TextAlignRight = v.InferInput<typeof textAlignRightSchema>;
