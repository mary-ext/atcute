import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('tools.ozone.verification.revokeVerifications', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			uris: /*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.resourceUriString()), [
				/*#__PURE__*/ v.arrayLength(0, 100),
			]),
			revokeReason: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1000)]),
			),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			revokedVerifications: /*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()),
			get failedRevocations() {
				return /*#__PURE__*/ v.array(revokeErrorSchema);
			},
		}),
	},
});
const _revokeErrorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.verification.revokeVerifications#revokeError'),
	),
	uri: /*#__PURE__*/ v.resourceUriString(),
	error: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;
type revokeError$schematype = typeof _revokeErrorSchema;

export interface mainSchema extends main$schematype {}
export interface revokeErrorSchema extends revokeError$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const revokeErrorSchema = _revokeErrorSchema as revokeErrorSchema;

export interface RevokeError extends v.InferInput<typeof revokeErrorSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.verification.revokeVerifications': mainSchema;
	}
}
