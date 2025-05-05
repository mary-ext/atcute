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
export const mainSchema = _mainSchema as mainSchema.$schema;
export interface Main extends v.InferInput<typeof mainSchema> {}
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'com.atproto.lexicon.schema': mainSchema.$schema;
	}
}
