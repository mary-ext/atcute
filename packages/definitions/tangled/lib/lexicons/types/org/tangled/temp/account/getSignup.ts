import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.account.getSignup', {
	params: /*#__PURE__*/ v.object({
		/** Verification token from the emailed link. */
		token: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Email address the signup was started with. */
			email: /*#__PURE__*/ v.string(),
			/**
			 * PDS the account will be created on, where the browser starts the OAuth request it passes to
			 * completeSignup.
			 */
			pds: /*#__PURE__*/ v.genericUriString(),
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
		'org.tangled.temp.account.getSignup': mainSchema;
	}
}
