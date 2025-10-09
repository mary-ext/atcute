import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.nsidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('com.atproto.lexicon.schema'),
		/**
		 * Indicates the 'version' of the Lexicon language. Must be '1' for the current atproto/Lexicon schema system.
		 */
		lexicon: /*#__PURE__*/ v.integer(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'com.atproto.lexicon.schema': mainSchema;
	}
}
