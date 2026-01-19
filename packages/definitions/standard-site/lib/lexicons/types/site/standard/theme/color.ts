import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _rgbSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('site.standard.theme.color#rgb')),
	/**
	 * @minimum 0
	 * @maximum 255
	 */
	b: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 255)]),
	/**
	 * @minimum 0
	 * @maximum 255
	 */
	g: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 255)]),
	/**
	 * @minimum 0
	 * @maximum 255
	 */
	r: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 255)]),
});
const _rgbaSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('site.standard.theme.color#rgba')),
	/**
	 * @minimum 0
	 * @maximum 100
	 */
	a: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
	/**
	 * @minimum 0
	 * @maximum 255
	 */
	b: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 255)]),
	/**
	 * @minimum 0
	 * @maximum 255
	 */
	g: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 255)]),
	/**
	 * @minimum 0
	 * @maximum 255
	 */
	r: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 255)]),
});

type rgb$schematype = typeof _rgbSchema;
type rgba$schematype = typeof _rgbaSchema;

export interface rgbSchema extends rgb$schematype {}
export interface rgbaSchema extends rgba$schematype {}

export const rgbSchema = _rgbSchema as rgbSchema;
export const rgbaSchema = _rgbaSchema as rgbaSchema;

export interface Rgb extends v.InferInput<typeof rgbSchema> {}
export interface Rgba extends v.InferInput<typeof rgbaSchema> {}
