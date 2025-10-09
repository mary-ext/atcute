import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.identity.signPlcOperation', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			alsoKnownAs: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			rotationKeys: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			services: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			/**
			 * A token received through com.atproto.identity.requestPlcOperationSignature
			 */
			token: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			verificationMethods: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * A signed DID PLC operation.
			 */
			operation: /*#__PURE__*/ v.unknown(),
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
		'com.atproto.identity.signPlcOperation': mainSchema;
	}
}
