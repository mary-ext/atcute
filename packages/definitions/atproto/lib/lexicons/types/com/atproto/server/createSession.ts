import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.server.createSession', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			identifier: /*#__PURE__*/ v.string(),
			password: /*#__PURE__*/ v.string(),
			authFactorToken: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			allowTakendown: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
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
			email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			emailConfirmed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			emailAuthFactor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			status: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<'takendown' | 'suspended' | 'deactivated' | (string & {})>(),
			),
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
		'com.atproto.server.createSession': mainSchema.$schema;
	}
}
