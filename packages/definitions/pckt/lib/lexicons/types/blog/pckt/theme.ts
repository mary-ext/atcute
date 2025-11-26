import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.theme')),
	/**
	 * Dark mode color palette
	 */
	get dark() {
		return paletteSchema;
	},
	/**
	 * Font family name (optional)
	 * @maxLength 100
	 */
	font: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	),
	/**
	 * Light mode color palette
	 */
	get light() {
		return paletteSchema;
	},
});
const _paletteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.theme#palette')),
	/**
	 * Accent color (hex value)
	 * @maxLength 7
	 */
	accent: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
	/**
	 * Background color (hex value)
	 * @maxLength 7
	 */
	background: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
	/**
	 * Link color (hex value)
	 * @maxLength 7
	 */
	link: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
	/**
	 * Surface hover color (hex value)
	 * @maxLength 7
	 */
	surfaceHover: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
	/**
	 * Primary text color (hex value)
	 * @maxLength 7
	 */
	text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 7)]),
});

type main$schematype = typeof _mainSchema;
type palette$schematype = typeof _paletteSchema;

export interface mainSchema extends main$schematype {}
export interface paletteSchema extends palette$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const paletteSchema = _paletteSchema as paletteSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Palette extends v.InferInput<typeof paletteSchema> {}
