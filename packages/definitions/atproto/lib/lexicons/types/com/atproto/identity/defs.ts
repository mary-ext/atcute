import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _identityInfoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.identity.defs#identityInfo')),
	did: /*#__PURE__*/ v.didString(),
	didDoc: /*#__PURE__*/ v.unknown(),
	handle: /*#__PURE__*/ v.handleString(),
});

type identityInfo$schematype = typeof _identityInfoSchema;

export interface identityInfoSchema extends identityInfo$schematype {}

export const identityInfoSchema = _identityInfoSchema as identityInfoSchema;

export interface IdentityInfo extends v.InferInput<typeof identityInfoSchema> {}
