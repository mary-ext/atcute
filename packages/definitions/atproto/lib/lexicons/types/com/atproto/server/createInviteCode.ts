import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.server.createInviteCode', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			useCount: /*#__PURE__*/ v.integer(),
			forAccount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			code: /*#__PURE__*/ v.string(),
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
		'com.atproto.server.createInviteCode': mainSchema.$schema;
	}
}
