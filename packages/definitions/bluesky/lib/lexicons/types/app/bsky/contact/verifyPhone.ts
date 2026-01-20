import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.contact.verifyPhone', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The code received via SMS as a result of the call to `app.bsky.contact.startPhoneVerification`.
			 */
			code: /*#__PURE__*/ v.string(),
			/**
			 * The phone number to verify. Should be the same as the one passed to `app.bsky.contact.startPhoneVerification`.
			 */
			phone: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * JWT to be used in a call to `app.bsky.contact.importContacts`. It is only valid for a single call.
			 */
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
		'app.bsky.contact.verifyPhone': mainSchema;
	}
}
