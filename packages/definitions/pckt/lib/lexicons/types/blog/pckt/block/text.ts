import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as BlogPcktRichtextFacet from '../richtext/facet.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.text')),
	/** Facets for text formatting and features */
	get facets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(BlogPcktRichtextFacet.mainSchema));
	},
	/** The plain text content */
	plaintext: /*#__PURE__*/ v.string(),
	/** Horizontal alignment of the block's text. Defaults to left when omitted. */
	textAlign: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'center' | 'left' | 'right' | (string & {})>()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
