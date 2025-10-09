import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.verification.revokeVerifications', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Reason for revoking the verification. This is optional and can be omitted if not needed.
			 * @maxLength 1000
			 */
			revokeReason: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1000)]),
			),
			/**
			 * Array of verification record uris to revoke
			 * @maxLength 100
			 */
			uris: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()), [
				/*#__PURE__*/ v.arrayLength(0, 100),
			]),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * List of verification uris that couldn't be revoked, including failure reasons
			 */
			get failedRevocations() {
				return /*#__PURE__*/ v.array(revokeErrorSchema);
			},
			/**
			 * List of verification uris successfully revoked
			 */
			revokedVerifications: /*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()),
		}),
	},
});
const _revokeErrorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.verification.revokeVerifications#revokeError'),
	),
	/**
	 * Description of the error that occurred during revocation.
	 */
	error: /*#__PURE__*/ v.string(),
	/**
	 * The AT-URI of the verification record that failed to revoke.
	 */
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type revokeError$schematype = typeof _revokeErrorSchema;

export interface mainSchema extends main$schematype {}
export interface revokeErrorSchema extends revokeError$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const revokeErrorSchema = _revokeErrorSchema as revokeErrorSchema;

export interface RevokeError extends v.InferInput<typeof revokeErrorSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.verification.revokeVerifications': mainSchema;
	}
}
