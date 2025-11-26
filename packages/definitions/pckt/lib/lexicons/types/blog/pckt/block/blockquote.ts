import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as BlogPcktBlockParagraph from './paragraph.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.blockquote')),
	/**
	 * Array of paragraph content
	 */
	get content() {
		return /*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([BlogPcktBlockParagraph.mainSchema]));
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
