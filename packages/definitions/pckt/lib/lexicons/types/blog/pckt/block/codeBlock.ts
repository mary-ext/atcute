import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as BlogPcktBlockText from './text.js';

const _codeBlockAttrsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.codeBlock#codeBlockAttrs')),
	/**
	 * Programming language for syntax highlighting (e.g., 'javascript', 'python', 'php')
	 * @maxLength 50
	 */
	language: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 50)]),
	),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.codeBlock')),
	/**
	 * Code block attributes
	 */
	get attrs() {
		return /*#__PURE__*/ v.optional(codeBlockAttrsSchema);
	},
	/**
	 * Array of text nodes containing the code
	 */
	get content() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(BlogPcktBlockText.mainSchema));
	},
});

type codeBlockAttrs$schematype = typeof _codeBlockAttrsSchema;
type main$schematype = typeof _mainSchema;

export interface codeBlockAttrsSchema extends codeBlockAttrs$schematype {}
export interface mainSchema extends main$schematype {}

export const codeBlockAttrsSchema = _codeBlockAttrsSchema as codeBlockAttrsSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface CodeBlockAttrs extends v.InferInput<typeof codeBlockAttrsSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
