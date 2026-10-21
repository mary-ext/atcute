import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _aspectRatioSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.theme#aspectRatio')),
	/** @minimum 1 */
	height: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/** @minimum 1 */
	width: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});
const _imageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.theme#image')),
	/** Pixel dimensions of the image, for laying it out before it loads (optional) */
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(aspectRatioSchema);
	},
	/**
	 * The image file
	 *
	 * @accept image/*
	 * @maxSize 5000000
	 */
	image: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
		/*#__PURE__*/ v.blobSize(5000000),
		/*#__PURE__*/ v.blobAccept(['image/*']),
	]),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.theme')),
	/** Image drawn behind the publication's pages (optional) */
	get backgroundImage() {
		return /*#__PURE__*/ v.optional(imageSchema);
	},
	/**
	 * Background tile size as a percentage when tileBackground is true (optional)
	 *
	 * @minimum 5
	 * @maximum 100
	 */
	backgroundTileSize: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(5, 100)]),
	),
	/**
	 * Corner style for UI elements and images: rounded or square (optional)
	 *
	 * @maxLength 16
	 */
	corners: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string<'round' | 'square' | (string & {})>(), [
			/*#__PURE__*/ v.stringLength(0, 16),
		]),
	),
	/** Dark mode color palette */
	get dark() {
		return paletteSchema;
	},
	/**
	 * Font family name (optional)
	 *
	 * @maxLength 100
	 */
	font: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	),
	/**
	 * Highlight color for quoted passages (optional)
	 *
	 * @maxLength 16
	 */
	highlightColor: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string<'theme' | 'yellow' | (string & {})>(), [
			/*#__PURE__*/ v.stringLength(0, 16),
		]),
	),
	/**
	 * Highlight shape for quoted passages (optional)
	 *
	 * @maxLength 32
	 */
	highlightShape: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.string<'chisel' | 'felt' | 'loose' | 'round' | 'scratchy' | 'square' | (string & {})>(),
			[/*#__PURE__*/ v.stringLength(0, 32)],
		),
	),
	/** Light mode color palette */
	get light() {
		return paletteSchema;
	},
	/** Whether to tile the background image instead of covering (optional) */
	tileBackground: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * Content background transparency percentage (optional)
	 *
	 * @minimum 0
	 * @maximum 100
	 */
	transparency: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
	),
	/** Wide logo shown in the publication header in place of the icon and name (optional) */
	get wordmark() {
		return /*#__PURE__*/ v.optional(imageSchema);
	},
	/** Version of the wordmark to show in dark mode (optional) */
	get wordmarkDark() {
		return /*#__PURE__*/ v.optional(imageSchema);
	},
});
const _paletteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.theme#palette')),
	/**
	 * Accent color (hex value)
	 *
	 * @maxLength 7
	 */
	accent: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
	/**
	 * Background color (hex value)
	 *
	 * @maxLength 7
	 */
	background: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
	/**
	 * Link color (hex value)
	 *
	 * @maxLength 7
	 */
	link: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
	/**
	 * Surface hover color (hex value)
	 *
	 * @maxLength 7
	 */
	surfaceHover: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
	/**
	 * Primary text color (hex value)
	 *
	 * @maxLength 7
	 */
	text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
});

type aspectRatio$schematype = typeof _aspectRatioSchema;
type image$schematype = typeof _imageSchema;
type main$schematype = typeof _mainSchema;
type palette$schematype = typeof _paletteSchema;

export interface aspectRatioSchema extends aspectRatio$schematype {}
export interface imageSchema extends image$schematype {}
export interface mainSchema extends main$schematype {}
export interface paletteSchema extends palette$schematype {}

export const aspectRatioSchema = _aspectRatioSchema as aspectRatioSchema;
export const imageSchema = _imageSchema as imageSchema;
export const mainSchema = _mainSchema as mainSchema;
export const paletteSchema = _paletteSchema as paletteSchema;

export interface AspectRatio extends v.InferInput<typeof aspectRatioSchema> {}
export interface Image extends v.InferInput<typeof imageSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Palette extends v.InferInput<typeof paletteSchema> {}
