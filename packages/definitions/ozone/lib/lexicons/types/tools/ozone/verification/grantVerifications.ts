import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneVerificationDefs from './defs.js';

const _grantErrorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.verification.grantVerifications#grantError'),
	),
	error: /*#__PURE__*/ v.string(),
	subject: /*#__PURE__*/ v.didString(),
});
const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.verification.grantVerifications', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get verifications() {
				return /*#__PURE__*/ v.constrain(v.array(verificationInputSchema), [
					/*#__PURE__*/ v.arrayLength(0, 100),
				]);
			},
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get verifications() {
				return /*#__PURE__*/ v.array(ToolsOzoneVerificationDefs.verificationViewSchema);
			},
			get failedVerifications() {
				return /*#__PURE__*/ v.array(grantErrorSchema);
			},
		}),
	},
});
const _verificationInputSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.verification.grantVerifications#verificationInput'),
	),
	subject: /*#__PURE__*/ v.didString(),
	handle: /*#__PURE__*/ v.handleString(),
	displayName: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type grantError$schematype = typeof _grantErrorSchema;
type main$schematype = typeof _mainSchema;
type verificationInput$schematype = typeof _verificationInputSchema;

export interface grantErrorSchema extends grantError$schematype {}
export interface mainSchema extends main$schematype {}
export interface verificationInputSchema extends verificationInput$schematype {}

export const grantErrorSchema = _grantErrorSchema as grantErrorSchema;
export const mainSchema = _mainSchema as mainSchema;
export const verificationInputSchema = _verificationInputSchema as verificationInputSchema;

export interface GrantError extends v.InferInput<typeof grantErrorSchema> {}
export interface VerificationInput extends v.InferInput<typeof verificationInputSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.verification.grantVerifications': mainSchema;
	}
}
