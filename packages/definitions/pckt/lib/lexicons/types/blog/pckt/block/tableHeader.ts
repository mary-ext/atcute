import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as BlogPcktBlockText from './text.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.tableHeader')),
	/**
	 * Number of columns this cell spans
	 * @minimum 1
	 */
	colspan: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	),
	/**
	 * Array of block content (typically text)
	 */
	get content() {
		return /*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([BlogPcktBlockText.mainSchema]));
	},
	/**
	 * Number of rows this cell spans
	 * @minimum 1
	 */
	rowspan: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
