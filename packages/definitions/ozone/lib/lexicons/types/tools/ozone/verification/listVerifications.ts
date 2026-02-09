import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneVerificationDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.verification.listVerifications', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Filter to verifications created after this timestamp
		 */
		createdAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Filter to verifications created before this timestamp
		 */
		createdBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * Pagination cursor
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Filter to verifications that are revoked or not. By default, includes both.
		 */
		isRevoked: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Filter to verifications from specific issuers
		 * @maxLength 100
		 */
		issuers: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
				/*#__PURE__*/ v.arrayLength(0, 100),
			]),
		),
		/**
		 * Maximum number of results to return
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * Sort direction for creation date
		 * @default "desc"
		 */
		sortDirection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['asc', 'desc']), 'desc'),
		/**
		 * Filter to specific verified DIDs
		 * @maxLength 100
		 */
		subjects: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
				/*#__PURE__*/ v.arrayLength(0, 100),
			]),
		),
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

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.verification.listVerifications': mainSchema;
	}
}
