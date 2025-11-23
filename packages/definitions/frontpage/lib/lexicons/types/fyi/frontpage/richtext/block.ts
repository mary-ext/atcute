import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('fyi.frontpage.richtext.block')),
	get content() {
		return /*#__PURE__*/ v.variant([plaintextParagraphSchema]);
	},
});
const _plaintextParagraphSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('fyi.frontpage.richtext.block#plaintextParagraph')),
	/**
	 * @maxLength 100000
	 * @maxGraphemes 10000
	 */
	text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 100000),
		/*#__PURE__*/ v.stringGraphemes(0, 10000),
	]),
});

type main$schematype = typeof _mainSchema;
type plaintextParagraph$schematype = typeof _plaintextParagraphSchema;

export interface mainSchema extends main$schematype {}
export interface plaintextParagraphSchema extends plaintextParagraph$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const plaintextParagraphSchema = _plaintextParagraphSchema as plaintextParagraphSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface PlaintextParagraph extends v.InferInput<typeof plaintextParagraphSchema> {}
