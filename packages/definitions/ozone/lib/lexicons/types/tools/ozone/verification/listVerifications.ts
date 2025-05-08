import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneVerificationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('tools.ozone.verification.listVerifications', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		createdAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		createdBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		issuers: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.didString()), [/*#__PURE__*/ v.arrayLength(0, 100)]),
		),
		subjects: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.didString()), [/*#__PURE__*/ v.arrayLength(0, 100)]),
		),
		sortDirection: /*#__PURE__*/ v.literalEnum(['asc', 'desc']),
		isRevoked: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get verifications() {
				return /*#__PURE__*/ v.array(ToolsOzoneVerificationDefs.verificationViewSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.verification.listVerifications': mainSchema;
	}
}
