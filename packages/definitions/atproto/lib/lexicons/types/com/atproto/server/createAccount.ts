import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.server.createAccount', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			handle: /*#__PURE__*/ v.handleString(),
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			inviteCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			verificationCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			verificationPhone: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			password: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			recoveryKey: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			plcOp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			accessJwt: /*#__PURE__*/ v.string(),
			refreshJwt: /*#__PURE__*/ v.string(),
			handle: /*#__PURE__*/ v.handleString(),
			did: /*#__PURE__*/ v.didString(),
			didDoc: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.createAccount': mainSchema;
	}
}
