import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.nsidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('com.atproto.lexicon.schema'),
		lexicon: /*#__PURE__*/ v.integer(),
	}),
);

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'com.atproto.lexicon.schema': main$schema;
	}
}
