import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as BlogPcktRichtextFacet from '../richtext/facet.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.heading')),
	/**
	 * Facets for text formatting and features
	 */
	get facets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(BlogPcktRichtextFacet.mainSchema));
	},
	/**
	 * Heading level from 1 (most important) to 6 (least important)
	 * @minimum 1
	 * @maximum 6
	 */
	level: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 6)]),
	),
	/**
	 * The plain text content of the heading
	 */
	plaintext: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
