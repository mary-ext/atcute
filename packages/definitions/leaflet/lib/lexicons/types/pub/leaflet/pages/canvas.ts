import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletBlocksBlockquote from '../blocks/blockquote.ts';
import * as PubLeafletBlocksBskyPost from '../blocks/bskyPost.ts';
import * as PubLeafletBlocksButton from '../blocks/button.ts';
import * as PubLeafletBlocksCode from '../blocks/code.ts';
import * as PubLeafletBlocksHeader from '../blocks/header.ts';
import * as PubLeafletBlocksHorizontalRule from '../blocks/horizontalRule.ts';
import * as PubLeafletBlocksIframe from '../blocks/iframe.ts';
import * as PubLeafletBlocksImage from '../blocks/image.ts';
import * as PubLeafletBlocksImageGallery from '../blocks/imageGallery.ts';
import * as PubLeafletBlocksMath from '../blocks/math.ts';
import * as PubLeafletBlocksMembersOnlyDelimiter from '../blocks/membersOnlyDelimiter.ts';
import * as PubLeafletBlocksOrderedList from '../blocks/orderedList.ts';
import * as PubLeafletBlocksPage from '../blocks/page.ts';
import * as PubLeafletBlocksPoll from '../blocks/poll.ts';
import * as PubLeafletBlocksPostsList from '../blocks/postsList.ts';
import * as PubLeafletBlocksSignup from '../blocks/signup.ts';
import * as PubLeafletBlocksStandardSitePost from '../blocks/standardSitePost.ts';
import * as PubLeafletBlocksStandardSitePublication from '../blocks/standardSitePublication.ts';
import * as PubLeafletBlocksText from '../blocks/text.ts';
import * as PubLeafletBlocksUnorderedList from '../blocks/unorderedList.ts';
import * as PubLeafletBlocksWebsite from '../blocks/website.ts';

const _blockSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.canvas#block')),
	get block() {
		return /*#__PURE__*/ v.variant([
			PubLeafletBlocksBlockquote.mainSchema,
			PubLeafletBlocksBskyPost.mainSchema,
			PubLeafletBlocksButton.mainSchema,
			PubLeafletBlocksCode.mainSchema,
			PubLeafletBlocksHeader.mainSchema,
			PubLeafletBlocksHorizontalRule.mainSchema,
			PubLeafletBlocksIframe.mainSchema,
			PubLeafletBlocksImage.mainSchema,
			PubLeafletBlocksImageGallery.mainSchema,
			PubLeafletBlocksMath.mainSchema,
			PubLeafletBlocksMembersOnlyDelimiter.mainSchema,
			PubLeafletBlocksOrderedList.mainSchema,
			PubLeafletBlocksPage.mainSchema,
			PubLeafletBlocksPoll.mainSchema,
			PubLeafletBlocksPostsList.mainSchema,
			PubLeafletBlocksSignup.mainSchema,
			PubLeafletBlocksStandardSitePost.mainSchema,
			PubLeafletBlocksStandardSitePublication.mainSchema,
			PubLeafletBlocksText.mainSchema,
			PubLeafletBlocksUnorderedList.mainSchema,
			PubLeafletBlocksWebsite.mainSchema,
		]);
	},
	height: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** The rotation of the block in degrees */
	rotation: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	width: /*#__PURE__*/ v.integer(),
	x: /*#__PURE__*/ v.integer(),
	y: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.canvas')),
	get blocks() {
		return /*#__PURE__*/ v.array(blockSchema);
	},
	id: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _positionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.canvas#position')),
	block: /*#__PURE__*/ v.array(/*#__PURE__*/ v.integer()),
	offset: /*#__PURE__*/ v.integer(),
});
const _quoteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.canvas#quote')),
	get end() {
		return positionSchema;
	},
	get start() {
		return positionSchema;
	},
});
const _textAlignCenterSchema = /*#__PURE__*/ v.literal('pub.leaflet.pages.canvas#textAlignCenter');
const _textAlignLeftSchema = /*#__PURE__*/ v.literal('pub.leaflet.pages.canvas#textAlignLeft');
const _textAlignRightSchema = /*#__PURE__*/ v.literal('pub.leaflet.pages.canvas#textAlignRight');

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
