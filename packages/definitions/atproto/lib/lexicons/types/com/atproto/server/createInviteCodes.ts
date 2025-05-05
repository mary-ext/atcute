import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.server.createInviteCodes', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			codeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 1),
			useCount: /*#__PURE__*/ v.integer(),
			forAccounts: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get codes() {
				return /*#__PURE__*/ v.array(accountCodesSchema);
			},
		}),
	},
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

const _accountCodesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.server.createInviteCodes#accountCodes'),
	),
	account: /*#__PURE__*/ v.string(),
	codes: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});
export const accountCodesSchema = _accountCodesSchema as accountCodesSchema.$schema;
export interface AccountCodes extends v.InferInput<typeof accountCodesSchema> {}
export declare namespace accountCodesSchema {
	export {};
	type $schematype = typeof _accountCodesSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.createInviteCodes': mainSchema.$schema;
	}
}
