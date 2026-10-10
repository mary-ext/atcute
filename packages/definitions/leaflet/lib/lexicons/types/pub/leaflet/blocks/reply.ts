import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.reply')),
	/**
	 * Label for the button readers use to submit a reply.
	 *
	 * @maxLength 500
	 * @maxGraphemes 50
	 */
	buttonText: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 500),
			/*#__PURE__*/ v.stringGraphemes(0, 50),
		]),
	),
	/**
	 * Text inviting readers to reply, shown beside the button.
	 *
	 * @maxLength 3000
	 * @maxGraphemes 300
	 */
	promptText: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	),
	/** Render each reply in its own publication's theme. Defaults to true. */
	showPublicationTheme: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
