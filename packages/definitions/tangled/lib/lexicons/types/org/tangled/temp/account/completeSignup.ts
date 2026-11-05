import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _authorizationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.temp.account.completeSignup#authorization'),
	),
	code: /*#__PURE__*/ v.string(),
	iss: /*#__PURE__*/ v.string(),
	state: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.account.completeSignup', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Password for the new account. */
			password: /*#__PURE__*/ v.string(),
			/**
			 * request_uri of the browser's pushed OAuth authorization request at the PDS. When the PDS supports it,
			 * the new account authorizes that request without the PDS sign-in and consent screens.
			 */
			requestUri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Verification token from the emailed link. */
			token: /*#__PURE__*/ v.string(),
			/** Desired username; the handle is <username>.<pds domain>. */
			username: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Present when the PDS authorized requestUri for the new account. Without it the browser signs in
			 * through the PDS.
			 */
			get authorization() {
				return /*#__PURE__*/ v.optional(authorizationSchema);
			},
			/** DID of the newly provisioned account. */
			did: /*#__PURE__*/ v.didString(),
			/** The assigned handle, <username>.<pds domain>. */
			handle: /*#__PURE__*/ v.string(),
		}),
	},
});

type authorization$schematype = typeof _authorizationSchema;
type main$schematype = typeof _mainSchema;

export interface authorizationSchema extends authorization$schematype {}
export interface mainSchema extends main$schematype {}

export const authorizationSchema = _authorizationSchema as authorizationSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Authorization extends v.InferInput<typeof authorizationSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.account.completeSignup': mainSchema;
	}
}
