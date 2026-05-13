import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletBlocksHeader from './header.ts';
import * as PubLeafletBlocksImage from './image.ts';
import * as PubLeafletBlocksText from './text.ts';
import * as PubLeafletBlocksUnorderedList from './unorderedList.ts';

const _listItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.orderedList#listItem')),
	/**
	 * If present, this item is a checklist item. true = checked, false = unchecked. If absent, this is a normal
	 * list item.
	 */
	checked: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * Nested ordered list items. Mutually exclusive with unorderedListChildren; if both are present, children
	 * takes precedence.
	 */
	get children() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(listItemSchema));
	},
	get content() {
		return /*#__PURE__*/ v.variant([
			PubLeafletBlocksHeader.mainSchema,
			PubLeafletBlocksImage.mainSchema,
			PubLeafletBlocksText.mainSchema,
		]);
	},
	/**
	 * A nested unordered list. Mutually exclusive with children; if both are present, children takes
	 * precedence.
	 */
	get unorderedListChildren() {
		return /*#__PURE__*/ v.optional(PubLeafletBlocksUnorderedList.mainSchema);
	},
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.orderedList')),
	get children() {
		return /*#__PURE__*/ v.array(listItemSchema);
	},
	/** The starting number for this ordered list. Defaults to 1 if not specified. */
	startIndex: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});

type listItem$schematype = typeof _listItemSchema;
type main$schematype = typeof _mainSchema;

export interface listItemSchema extends listItem$schematype {}
export interface mainSchema extends main$schematype {}

export const listItemSchema = _listItemSchema as listItemSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface ListItem extends v.InferInput<typeof listItemSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
