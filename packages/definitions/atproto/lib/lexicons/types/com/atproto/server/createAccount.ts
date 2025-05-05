import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.server.createAccount', {
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
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.createAccount': mainSchema.$schema;
	}
}
