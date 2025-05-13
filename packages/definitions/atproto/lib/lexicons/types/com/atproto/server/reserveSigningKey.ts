import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.server.reserveSigningKey', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			signingKey: /*#__PURE__*/ v.string(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.reserveSigningKey': mainSchema;
	}
}
