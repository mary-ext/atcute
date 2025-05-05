import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.strongRef')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.string(),
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export interface Main extends v.InferInput<typeof mainSchema> {}
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}
