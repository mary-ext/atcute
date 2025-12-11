import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as BlogPcktBlockHardBreak from './hardBreak.js';
import * as BlogPcktBlockMention from './mention.js';
import * as BlogPcktBlockText from './text.js';
import * as BlogPcktRichtextFacet from '../richtext/facet.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.paragraph')),
	/**
	 * Array of inline content nodes (text, hard breaks, and mentions)
	 */
	get content() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.variant([
					BlogPcktBlockHardBreak.mainSchema,
					BlogPcktBlockMention.mainSchema,
					BlogPcktBlockText.mainSchema,
				]),
			),
		);
	},
	/**
	 * Facets for text formatting and features within this paragraph
	 */
	get facets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(BlogPcktRichtextFacet.mainSchema));
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
