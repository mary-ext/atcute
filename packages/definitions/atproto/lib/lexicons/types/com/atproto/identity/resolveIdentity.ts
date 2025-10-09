import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoIdentityDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.identity.resolveIdentity', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Handle or DID to resolve.
		 */
		identifier: /*#__PURE__*/ v.actorIdentifierString(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return ComAtprotoIdentityDefs.identityInfoSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.identity.resolveIdentity': mainSchema;
	}
}
