import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.event.push')),
	/** The account that pushed. */
	actor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	newSha: /*#__PURE__*/ v.string(),
	oldSha: /*#__PURE__*/ v.string(),
	/**
	 * The push options sent with the push, omitted when there were none.
	 *
	 * @maxLength 50
	 */
	pushOptions: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
			/*#__PURE__*/ v.arrayLength(0, 50),
		]),
	),
	ref: /*#__PURE__*/ v.string(),
	repo: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
