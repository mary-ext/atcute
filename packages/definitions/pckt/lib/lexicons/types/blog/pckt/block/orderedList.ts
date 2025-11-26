import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as BlogPcktBlockListItem from './listItem.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.orderedList')),
	/**
	 * Optional attributes for the ordered list
	 */
	get attrs() {
		return /*#__PURE__*/ v.optional(orderedListAttrsSchema);
	},
	/**
	 * Array of list items
	 */
	get content() {
		return /*#__PURE__*/ v.array(BlogPcktBlockListItem.mainSchema);
	},
});
const _orderedListAttrsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.orderedList#orderedListAttrs')),
	/**
	 * Starting number for the ordered list
	 * @minimum 1
	 */
	start: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	),
});

type main$schematype = typeof _mainSchema;
type orderedListAttrs$schematype = typeof _orderedListAttrsSchema;

export interface mainSchema extends main$schematype {}
export interface orderedListAttrsSchema extends orderedListAttrs$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const orderedListAttrsSchema = _orderedListAttrsSchema as orderedListAttrsSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface OrderedListAttrs extends v.InferInput<typeof orderedListAttrsSchema> {}
