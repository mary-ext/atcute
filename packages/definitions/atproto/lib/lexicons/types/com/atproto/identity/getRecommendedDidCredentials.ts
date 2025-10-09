import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.identity.getRecommendedDidCredentials', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			alsoKnownAs: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			/**
			 * Recommended rotation keys for PLC dids. Should be undefined (or ignored) for did:webs.
			 */
			rotationKeys: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			services: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			verificationMethods: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.identity.getRecommendedDidCredentials': mainSchema;
	}
}
