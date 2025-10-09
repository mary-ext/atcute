import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.server.createAccount', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Pre-existing atproto DID, being imported to a new account.
			 */
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Requested handle for the account.
			 */
			handle: /*#__PURE__*/ v.handleString(),
			inviteCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Initial account password. May need to meet instance-specific password strength requirements.
			 */
			password: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * A signed DID PLC operation to be submitted as part of importing an existing account to this instance. NOTE: this optional field may be updated when full account migration is implemented.
			 */
			plcOp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			/**
			 * DID PLC rotation key (aka, recovery key) to be included in PLC creation operation.
			 */
			recoveryKey: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			verificationCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			verificationPhone: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			accessJwt: /*#__PURE__*/ v.string(),
			/**
			 * The DID of the new account.
			 */
			did: /*#__PURE__*/ v.didString(),
			/**
			 * Complete DID document.
			 */
			didDoc: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			handle: /*#__PURE__*/ v.handleString(),
			refreshJwt: /*#__PURE__*/ v.string(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.createAccount': mainSchema;
	}
}
