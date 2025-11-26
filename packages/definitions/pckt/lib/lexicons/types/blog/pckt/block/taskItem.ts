import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as BlogPcktBlockParagraph from './paragraph.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.taskItem')),
	/**
	 * Task item attributes
	 */
	get attrs() {
		return taskItemAttrsSchema;
	},
	/**
	 * Array of paragraph content
	 */
	get content() {
		return /*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([BlogPcktBlockParagraph.mainSchema]));
	},
});
const _taskItemAttrsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.taskItem#taskItemAttrs')),
	/**
	 * Whether the task is checked or unchecked
	 */
	checked: /*#__PURE__*/ v.boolean(),
});

type main$schematype = typeof _mainSchema;
type taskItemAttrs$schematype = typeof _taskItemAttrsSchema;

export interface mainSchema extends main$schematype {}
export interface taskItemAttrsSchema extends taskItemAttrs$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const taskItemAttrsSchema = _taskItemAttrsSchema as taskItemAttrsSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface TaskItemAttrs extends v.InferInput<typeof taskItemAttrsSchema> {}
