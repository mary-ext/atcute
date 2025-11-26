import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as BlogPcktBlockHardBreak from './hardBreak.js';
import * as BlogPcktBlockText from './text.js';

const _headingAttrsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.heading#headingAttrs')),
	/**
	 * Heading level from 1 (most important) to 6 (least important)
	 * @minimum 1
	 * @maximum 6
	 */
	level: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 6)]),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.heading')),
	/**
	 * Heading attributes
	 */
	get attrs() {
		return headingAttrsSchema;
	},
	/**
	 * Inline content of the heading (text with optional formatting)
	 */
	get content() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.variant([BlogPcktBlockHardBreak.mainSchema, BlogPcktBlockText.mainSchema]),
			),
		);
	},
});

type headingAttrs$schematype = typeof _headingAttrsSchema;
type main$schematype = typeof _mainSchema;

export interface headingAttrsSchema extends headingAttrs$schematype {}
export interface mainSchema extends main$schematype {}

export const headingAttrsSchema = _headingAttrsSchema as headingAttrsSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface HeadingAttrs extends v.InferInput<typeof headingAttrsSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
