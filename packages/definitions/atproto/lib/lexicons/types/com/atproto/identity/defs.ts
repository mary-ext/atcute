import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _identityInfoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.identity.defs#identityInfo')),
	did: /*#__PURE__*/ v.didString(),
	handle: /*#__PURE__*/ v.handleString(),
	didDoc: /*#__PURE__*/ v.unknown(),
});
export const identityInfoSchema = _identityInfoSchema as identityInfoSchema.$schema;
export interface IdentityInfo extends v.InferInput<typeof identityInfoSchema> {}
export declare namespace identityInfoSchema {
	export {};
	type $schematype = typeof _identityInfoSchema;
	export interface $schema extends $schematype {}
}
