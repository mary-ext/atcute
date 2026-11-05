import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.repo.mintToken', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Audience of the minted token, a DID service ref for the service, that the token is addressed to. */
			aud: /*#__PURE__*/ v.didString(),
			/** Unix seconds. Must be in the future, and at most 60s after mint time. */
			exp: /*#__PURE__*/ v.integer(),
			/** Lexicon method to which minted token binds. */
			lxm: /*#__PURE__*/ v.nsidString(),
			/** DID of the repo that becomes the token's issuer. Must be the audience of a given calling session. */
			repo: /*#__PURE__*/ v.didString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** The signed service-auth JWT. */
			token: /*#__PURE__*/ v.string(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.repo.mintToken': mainSchema;
	}
}
