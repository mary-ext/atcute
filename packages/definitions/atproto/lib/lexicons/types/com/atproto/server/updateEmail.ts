import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.server.updateEmail', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			email: /*#__PURE__*/ v.string(),
			emailAuthFactor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Requires a token from com.atproto.sever.requestEmailUpdate if the account's email has been confirmed.
			 */
			token: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.updateEmail': mainSchema;
	}
}
