import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as BlogPcktBlockBlockquote from './blockquote.ts';
import * as BlogPcktBlockBulletList from './bulletList.ts';
import * as BlogPcktBlockCodeBlock from './codeBlock.ts';
import * as BlogPcktBlockHeading from './heading.ts';
import * as BlogPcktBlockHorizontalRule from './horizontalRule.ts';
import * as BlogPcktBlockImage from './image.ts';
import * as BlogPcktBlockOrderedList from './orderedList.ts';
import * as BlogPcktBlockTaskList from './taskList.ts';
import * as BlogPcktBlockText from './text.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.column')),
	/** Array of content blocks, top to bottom */
	get content() {
		return /*#__PURE__*/ v.array(
			/*#__PURE__*/ v.variant([
				BlogPcktBlockBlockquote.mainSchema,
				BlogPcktBlockBulletList.mainSchema,
				BlogPcktBlockCodeBlock.mainSchema,
				BlogPcktBlockHeading.mainSchema,
				BlogPcktBlockHorizontalRule.mainSchema,
				BlogPcktBlockImage.mainSchema,
				BlogPcktBlockOrderedList.mainSchema,
				BlogPcktBlockTaskList.mainSchema,
				BlogPcktBlockText.mainSchema,
			]),
		);
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
