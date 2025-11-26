import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as BlogPcktMarkBold from '../mark/bold.js';
import * as BlogPcktMarkCode from '../mark/code.js';
import * as BlogPcktMarkItalic from '../mark/italic.js';
import * as BlogPcktMarkLink from '../mark/link.js';
import * as BlogPcktMarkStrike from '../mark/strike.js';
import * as BlogPcktMarkUnderline from '../mark/underline.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.text')),
	/**
	 * Optional array of formatting marks applied to this text (bold, italic, links, etc.)
	 */
	get marks() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.variant([
					BlogPcktMarkBold.mainSchema,
					BlogPcktMarkCode.mainSchema,
					BlogPcktMarkItalic.mainSchema,
					BlogPcktMarkLink.mainSchema,
					BlogPcktMarkStrike.mainSchema,
					BlogPcktMarkUnderline.mainSchema,
				]),
			),
		);
	},
	/**
	 * The actual text content
	 * @maxLength 10000
	 * @maxGraphemes 5000
	 */
	text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 10000),
		/*#__PURE__*/ v.stringGraphemes(0, 5000),
	]),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
