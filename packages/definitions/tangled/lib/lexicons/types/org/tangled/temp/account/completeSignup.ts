import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.account.completeSignup', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Verification code from the signup email. */
			code: /*#__PURE__*/ v.string(),
			/** Password for the new account. */
			password: /*#__PURE__*/ v.string(),
			/** Desired username; the assigned handle is <username>.<pds domain>. */
			username: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** DID of the newly provisioned account. */
			did: /*#__PURE__*/ v.didString(),
			/** The assigned handle, <username>.<pds domain>. */
			handle: /*#__PURE__*/ v.string(),
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
		'org.tangled.temp.account.completeSignup': mainSchema;
	}
}
