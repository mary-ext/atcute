import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _setSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.set.defs#set')),
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(3, 128)]),
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 10240),
			/*#__PURE__*/ v.stringGraphemes(0, 1024),
		]),
	),
});
const _setViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.set.defs#setView')),
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(3, 128)]),
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 10240),
			/*#__PURE__*/ v.stringGraphemes(0, 1024),
		]),
	),
	setSize: /*#__PURE__*/ v.integer(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});

type set$schematype = typeof _setSchema;
type setView$schematype = typeof _setViewSchema;

export interface setSchema extends set$schematype {}
export interface setViewSchema extends setView$schematype {}

export const setSchema = _setSchema as setSchema;
export const setViewSchema = _setViewSchema as setViewSchema;

export interface Set extends v.InferInput<typeof setSchema> {}
export interface SetView extends v.InferInput<typeof setViewSchema> {}
