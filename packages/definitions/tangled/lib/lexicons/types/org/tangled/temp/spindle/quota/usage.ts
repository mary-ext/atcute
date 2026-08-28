import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTempSpindleQuotaDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.spindle.quota.usage', {
	params: /*#__PURE__*/ v.object({
		/** limit results to rows for this subject DID */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/** limit results to one aggregation axis: user or repo */
		scope: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'repo' | 'user' | (string & {})>()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** non-zero usage rows, including active reservations and committed allocations */
			get usages() {
				return /*#__PURE__*/ v.array(OrgTangledTempSpindleQuotaDefs.usageSchema);
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
		'org.tangled.temp.spindle.quota.usage': mainSchema;
	}
}
