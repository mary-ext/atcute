import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _accountCodesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.server.createInviteCodes#accountCodes'),
	),
	account: /*#__PURE__*/ v.string(),
	codes: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});
const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.server.createInviteCodes', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * @default 1
			 */
			codeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 1),
			forAccounts: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
			useCount: /*#__PURE__*/ v.integer(),
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

type accountCodes$schematype = typeof _accountCodesSchema;
type main$schematype = typeof _mainSchema;

export interface accountCodesSchema extends accountCodes$schematype {}
export interface mainSchema extends main$schematype {}

export const accountCodesSchema = _accountCodesSchema as accountCodesSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface AccountCodes extends v.InferInput<typeof accountCodesSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.createInviteCodes': mainSchema;
	}
}
