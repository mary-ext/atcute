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
const _accountCodesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.server.createInviteCodes#accountCodes'),
	),
	account: /*#__PURE__*/ v.string(),
	codes: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});

type main$schematype = typeof _mainSchema;
type accountCodes$schematype = typeof _accountCodesSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}
/** @deprecated */
export interface accountCodes$schema extends accountCodes$schematype {}

export const mainSchema = _mainSchema as main$schema;
export const accountCodesSchema = _accountCodesSchema as accountCodes$schema;

export interface AccountCodes extends v.InferInput<typeof accountCodesSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.createInviteCodes': main$schema;
	}
}
