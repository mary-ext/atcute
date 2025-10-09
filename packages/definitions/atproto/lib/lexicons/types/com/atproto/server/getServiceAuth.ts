import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.server.getServiceAuth', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The DID of the service that the token will be used to authenticate with
		 */
		aud: /*#__PURE__*/ v.didString(),
		/**
		 * The time in Unix Epoch seconds that the JWT expires. Defaults to 60 seconds in the future. The service may enforce certain time bounds on tokens depending on the requested scope.
		 */
		exp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Lexicon (XRPC) method to bind the requested token to
		 */
		lxm: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nsidString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			token: /*#__PURE__*/ v.string(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.getServiceAuth': mainSchema;
	}
}
