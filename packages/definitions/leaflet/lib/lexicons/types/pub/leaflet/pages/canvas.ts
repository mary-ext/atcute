import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletBlocksBlockquote from '../blocks/blockquote.ts';
import * as PubLeafletBlocksBskyPost from '../blocks/bskyPost.ts';
import * as PubLeafletBlocksButton from '../blocks/button.ts';
import * as PubLeafletBlocksCode from '../blocks/code.ts';
import * as PubLeafletBlocksDrawing from '../blocks/drawing.ts';
import * as PubLeafletBlocksEmbeddedCanvas from '../blocks/embeddedCanvas.ts';
import * as PubLeafletBlocksHeader from '../blocks/header.ts';
import * as PubLeafletBlocksHorizontalRule from '../blocks/horizontalRule.ts';
import * as PubLeafletBlocksHtml from '../blocks/html.ts';
import * as PubLeafletBlocksIframe from '../blocks/iframe.ts';
import * as PubLeafletBlocksImage from '../blocks/image.ts';
import * as PubLeafletBlocksImageGallery from '../blocks/imageGallery.ts';
import * as PubLeafletBlocksMath from '../blocks/math.ts';
import * as PubLeafletBlocksMembersOnlyDelimiter from '../blocks/membersOnlyDelimiter.ts';
import * as PubLeafletBlocksOrderedList from '../blocks/orderedList.ts';
import * as PubLeafletBlocksPage from '../blocks/page.ts';
import * as PubLeafletBlocksPoll from '../blocks/poll.ts';
import * as PubLeafletBlocksPostHeader from '../blocks/postHeader.ts';
import * as PubLeafletBlocksPostsList from '../blocks/postsList.ts';
import * as PubLeafletBlocksQuestions from '../blocks/questions.ts';
import * as PubLeafletBlocksRecommendedPubs from '../blocks/recommendedPubs.ts';
import * as PubLeafletBlocksReply from '../blocks/reply.ts';
import * as PubLeafletBlocksSignup from '../blocks/signup.ts';
import * as PubLeafletBlocksStandardSitePost from '../blocks/standardSitePost.ts';
import * as PubLeafletBlocksStandardSitePublication from '../blocks/standardSitePublication.ts';
import * as PubLeafletBlocksText from '../blocks/text.ts';
import * as PubLeafletBlocksUnorderedList from '../blocks/unorderedList.ts';
import * as PubLeafletBlocksWebsite from '../blocks/website.ts';
import * as PubLeafletThemePage from '../theme/page.ts';

import * as PubLeafletPagesLinearDocument from './linearDocument.ts';

const _backgroundSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.canvas#background')),
	/**
	 * @accept image/*
	 * @maxSize 1000000
	 */
	image: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
		/*#__PURE__*/ v.blobSize(1000000),
		/*#__PURE__*/ v.blobAccept(['image/*']),
	]),
	/**
	 * Opacity of the image as a percentage. Defaults to 100.
	 *
	 * @minimum 0
	 * @maximum 100
	 */
	opacity: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
	),
	/** Width of each tile in canvas px. Defaults to 500. */
	width: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _blockSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.canvas#block')),
	/** Alignment of a single block's content. A linear document's blocks carry their own. */
	alignment: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			| 'lex:pub.leaflet.pages.linearDocument#textAlignCenter'
			| 'lex:pub.leaflet.pages.linearDocument#textAlignJustify'
			| 'lex:pub.leaflet.pages.linearDocument#textAlignLeft'
			| 'lex:pub.leaflet.pages.linearDocument#textAlignRight'
			| (string & {})
		>(),
	),
	/**
	 * A single block, or a linear document: blocks grouped in reading order that are positioned, sized and
	 * rotated on the canvas as one.
	 */
	get block() {
		return /*#__PURE__*/ v.variant([
			PubLeafletBlocksBlockquote.mainSchema,
			PubLeafletBlocksBskyPost.mainSchema,
			PubLeafletBlocksButton.mainSchema,
			PubLeafletBlocksCode.mainSchema,
			PubLeafletBlocksDrawing.mainSchema,
			PubLeafletBlocksEmbeddedCanvas.mainSchema,
			PubLeafletBlocksHeader.mainSchema,
			PubLeafletBlocksHorizontalRule.mainSchema,
			PubLeafletBlocksHtml.mainSchema,
			PubLeafletBlocksIframe.mainSchema,
			PubLeafletBlocksImage.mainSchema,
			PubLeafletBlocksImageGallery.mainSchema,
			PubLeafletBlocksMath.mainSchema,
			PubLeafletBlocksMembersOnlyDelimiter.mainSchema,
			PubLeafletBlocksOrderedList.mainSchema,
			PubLeafletBlocksPage.mainSchema,
			PubLeafletBlocksPoll.mainSchema,
			PubLeafletBlocksPostHeader.mainSchema,
			PubLeafletBlocksPostsList.mainSchema,
			PubLeafletBlocksQuestions.mainSchema,
			PubLeafletBlocksRecommendedPubs.mainSchema,
			PubLeafletBlocksReply.mainSchema,
			PubLeafletBlocksSignup.mainSchema,
			PubLeafletBlocksStandardSitePost.mainSchema,
			PubLeafletBlocksStandardSitePublication.mainSchema,
			PubLeafletBlocksText.mainSchema,
			PubLeafletBlocksUnorderedList.mainSchema,
			PubLeafletBlocksWebsite.mainSchema,
			PubLeafletPagesLinearDocument.mainSchema,
		]);
	},
	height: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** The rotation of the block in degrees */
	rotation: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * Fractional index ordering this block against its siblings on the z axis. Blocks without one stack below
	 * every block with one, ordered by position.
	 */
	stackOrder: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	width: /*#__PURE__*/ v.integer(),
	x: /*#__PURE__*/ v.integer(),
	y: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.pages.canvas')),
	get background() {
		return /*#__PURE__*/ v.optional(backgroundSchema);
	},
	get blocks() {
		return /*#__PURE__*/ v.array(blockSchema);
	},
	/** Fixed canvas height in canvas px; see width. */
	height: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	id: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Viewers cannot zoom the canvas or scroll it sideways: no wheel, pinch, double-tap or zoom controls, and
	 * the initial framing (see mobileView) stays. Vertical scrolling is unaffected.
	 */
	lockViewerZoom: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * How a narrow viewport frames the canvas: the whole canvas scaled to fit the width (unconstrained, the
	 * default), or a phone-width area anchored to the canvas's left edge or centered on it, shown at up to
	 * 1:1.
	 */
	mobileView: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'center' | 'left' | 'unconstrained' | (string & {})>(),
	),
	/**
	 * The guide pattern drawn over the canvas's background, under its blocks. Absent, a canvas that grows with
	 * its content shows the grid and a fixed-size canvas is plain.
	 */
	pattern: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'dot' | 'grid' | 'plain' | (string & {})>()),
	get theme() {
		return /*#__PURE__*/ v.optional(PubLeafletThemePage.mainSchema);
	},
	/**
	 * Fixed canvas width in canvas px. With height, bounds the canvas: blocks are clipped to the area. Absent,
	 * the canvas grows with its content and is 1272px wide, or as wide as the inside of the publication's page
	 * (its theme's pageWidth) when it is one of a publication's pages.
	 */
	width: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
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

type background$schematype = typeof _backgroundSchema;
type block$schematype = typeof _blockSchema;
type main$schematype = typeof _mainSchema;
type position$schematype = typeof _positionSchema;
type quote$schematype = typeof _quoteSchema;
type textAlignCenter$schematype = typeof _textAlignCenterSchema;
type textAlignLeft$schematype = typeof _textAlignLeftSchema;
type textAlignRight$schematype = typeof _textAlignRightSchema;

export interface backgroundSchema extends background$schematype {}
export interface blockSchema extends block$schematype {}
export interface mainSchema extends main$schematype {}
export interface positionSchema extends position$schematype {}
export interface quoteSchema extends quote$schematype {}
export interface textAlignCenterSchema extends textAlignCenter$schematype {}
export interface textAlignLeftSchema extends textAlignLeft$schematype {}
export interface textAlignRightSchema extends textAlignRight$schematype {}

export const backgroundSchema = _backgroundSchema as backgroundSchema;
export const blockSchema = _blockSchema as blockSchema;
export const mainSchema = _mainSchema as mainSchema;
export const positionSchema = _positionSchema as positionSchema;
export const quoteSchema = _quoteSchema as quoteSchema;
export const textAlignCenterSchema = _textAlignCenterSchema as textAlignCenterSchema;
export const textAlignLeftSchema = _textAlignLeftSchema as textAlignLeftSchema;
export const textAlignRightSchema = _textAlignRightSchema as textAlignRightSchema;

export interface Background extends v.InferInput<typeof backgroundSchema> {}
export interface Block extends v.InferInput<typeof blockSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Position extends v.InferInput<typeof positionSchema> {}
export interface Quote extends v.InferInput<typeof quoteSchema> {}
export type TextAlignCenter = v.InferInput<typeof textAlignCenterSchema>;
export type TextAlignLeft = v.InferInput<typeof textAlignLeftSchema>;
export type TextAlignRight = v.InferInput<typeof textAlignRightSchema>;
