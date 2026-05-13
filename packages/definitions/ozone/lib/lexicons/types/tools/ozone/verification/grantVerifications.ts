import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneVerificationDefs from './defs.ts';

const _grantErrorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.verification.grantVerifications#grantError'),
	),
	/** Error message describing the reason for failure. */
	error: /*#__PURE__*/ v.string(),
	/** The did of the subject being verified */
	subject: /*#__PURE__*/ v.didString(),
});
const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.verification.grantVerifications', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Array of verification requests to process
			 *
			 * @maxLength 100
			 */
			get verifications() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(verificationInputSchema), [
					/*#__PURE__*/ v.arrayLength(0, 100),
				]);
			},
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get failedVerifications() {
				return /*#__PURE__*/ v.array(grantErrorSchema);
			},
			get verifications() {
				return /*#__PURE__*/ v.array(ToolsOzoneVerificationDefs.verificationViewSchema);
			},
		}),
	},
});
const _verificationInputSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.verification.grantVerifications#verificationInput'),
	),
	/** Timestamp for verification record. Defaults to current time when not specified. */
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Display name of the subject the verification applies to at the moment of verifying. */
	displayName: /*#__PURE__*/ v.string(),
	/** Handle of the subject the verification applies to at the moment of verifying. */
	handle: /*#__PURE__*/ v.handleString(),
	/** The did of the subject being verified */
	subject: /*#__PURE__*/ v.didString(),
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

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.verification.grantVerifications': mainSchema;
	}
}
