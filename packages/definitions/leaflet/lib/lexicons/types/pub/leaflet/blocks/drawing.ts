import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _fillSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.drawing#fill')),
	/** A CSS hex color, or one of the document theme's colors: primary (text), accent, or tertiary (faded text). */
	color: /*#__PURE__*/ v.string(),
	/** Flattened vertices as x, y pairs in drawing space. The last joins back to the first. */
	points: /*#__PURE__*/ v.array(/*#__PURE__*/ v.integer()),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.drawing')),
	/** Painted in order, beneath the strokes. */
	get fills() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(fillSchema));
	},
	get strokes() {
		return /*#__PURE__*/ v.array(strokeSchema);
	},
	get viewBox() {
		return viewBoxSchema;
	},
});
const _strokeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.drawing#stroke')),
	/** A CSS hex color, or one of the document theme's colors: primary (text), accent, or tertiary (faded text). */
	color: /*#__PURE__*/ v.string(),
	/** Flattened input points as x, y, pressure triples: x and y in drawing space, pressure from 0 to 1000. */
	points: /*#__PURE__*/ v.array(/*#__PURE__*/ v.integer()),
	/** The input had no real pressure (a mouse or finger); derive it from the stroke's speed instead. */
	simulatePressure: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * The stroke's base diameter in drawing space.
	 *
	 * @minimum 1
	 */
	size: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});
const _viewBoxSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.drawing#viewBox')),
	/** @minimum 1 */
	height: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/** @minimum 1 */
	width: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	x: /*#__PURE__*/ v.integer(),
	y: /*#__PURE__*/ v.integer(),
});

type fill$schematype = typeof _fillSchema;
type main$schematype = typeof _mainSchema;
type stroke$schematype = typeof _strokeSchema;
type viewBox$schematype = typeof _viewBoxSchema;

export interface fillSchema extends fill$schematype {}
export interface mainSchema extends main$schematype {}
export interface strokeSchema extends stroke$schematype {}
export interface viewBoxSchema extends viewBox$schematype {}

export const fillSchema = _fillSchema as fillSchema;
export const mainSchema = _mainSchema as mainSchema;
export const strokeSchema = _strokeSchema as strokeSchema;
export const viewBoxSchema = _viewBoxSchema as viewBoxSchema;

export interface Fill extends v.InferInput<typeof fillSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Stroke extends v.InferInput<typeof strokeSchema> {}
export interface ViewBox extends v.InferInput<typeof viewBoxSchema> {}
