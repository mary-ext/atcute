import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.questions')),
	/**
	 * Who may ask: anyone, only accounts the author follows, or only accounts following the author. Defaults to
	 * anyone. Checked when a question is asked.
	 */
	audience: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'anyone' | 'followers' | 'follows' | (string & {})>(),
	),
	/**
	 * Label for the button readers use to submit a question.
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
	 * Tells this block apart from the document's other blocks of its type; interaction records name it in their
	 * `block` field. Records without a matching key belong to the first block of the type.
	 *
	 * @maxLength 100
	 */
	key: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	),
	/** Show readers questions the author hasn't accepted, answered or hidden yet. Defaults to false. */
	showPending: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
