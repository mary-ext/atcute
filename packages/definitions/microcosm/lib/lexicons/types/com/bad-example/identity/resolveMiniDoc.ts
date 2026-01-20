import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('com.bad-example.identity.resolveMiniDoc', {
	params: /*#__PURE__*/ v.object({
		/**
		 * handle or DID to resolve
		 */
		identifier: /*#__PURE__*/ v.actorIdentifierString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * DID, bi-directionally verified if a handle was provided in the query
			 */
			did: /*#__PURE__*/ v.didString(),
			/**
			 * the validated handle of the account or 'handle.invalid' if the handle did not bi-directionally match the DID document
			 */
			handle: /*#__PURE__*/ v.handleString(),
			/**
			 * the identity's PDS URL
			 */
			pds: /*#__PURE__*/ v.genericUriString(),
			/**
			 * the atproto signing key publicKeyMultibase
			 */
			signing_key: /*#__PURE__*/ v.string(),
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
		'com.bad-example.identity.resolveMiniDoc': mainSchema;
	}
}
