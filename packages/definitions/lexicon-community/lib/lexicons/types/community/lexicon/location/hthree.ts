import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.location.hthree')),
	/**
	 * The name of the location.
	 */
	name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The h3 encoded location.
	 */
	value: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
