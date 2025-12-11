import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as BlogPcktBlockBulletList from './bulletList.js';
import * as BlogPcktBlockOrderedList from './orderedList.js';
import * as BlogPcktBlockText from './text.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.listItem')),
	/**
	 * Array of block content (text or nested lists)
	 */
	get content() {
		return /*#__PURE__*/ v.array(
			/*#__PURE__*/ v.variant([
				BlogPcktBlockBulletList.mainSchema,
				BlogPcktBlockOrderedList.mainSchema,
				BlogPcktBlockText.mainSchema,
			]),
		);
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
