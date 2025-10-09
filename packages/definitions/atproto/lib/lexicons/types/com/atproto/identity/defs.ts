import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _identityInfoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.identity.defs#identityInfo')),
	did: /*#__PURE__*/ v.didString(),
	/**
	 * The complete DID document for the identity.
	 */
	didDoc: /*#__PURE__*/ v.unknown(),
	/**
	 * The validated handle of the account; or 'handle.invalid' if the handle did not bi-directionally match the DID document.
	 */
	handle: /*#__PURE__*/ v.handleString(),
});

type identityInfo$schematype = typeof _identityInfoSchema;

export interface identityInfoSchema extends identityInfo$schematype {}

export const identityInfoSchema = _identityInfoSchema as identityInfoSchema;

export interface IdentityInfo extends v.InferInput<typeof identityInfoSchema> {}
