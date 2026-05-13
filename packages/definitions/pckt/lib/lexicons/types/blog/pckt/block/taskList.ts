import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as BlogPcktBlockTaskItem from './taskItem.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.taskList')),
	/** Array of task items */
	get content() {
		return /*#__PURE__*/ v.array(BlogPcktBlockTaskItem.mainSchema);
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
