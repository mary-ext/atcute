import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneSafelinkDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.safelink.queryEvents', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Cursor for pagination
			 */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
			 * Filter by pattern type
			 */
			patternType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Sort direction
			 * @default "desc"
			 */
			sortDirection: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<'asc' | 'desc' | (string & {})>(),
				'desc',
			),
			/**
			 * Filter by specific URLs or domains
			 */
			urls: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Next cursor for pagination. Only present if there are more results.
			 */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get events() {
				return /*#__PURE__*/ v.array(ToolsOzoneSafelinkDefs.eventSchema);
			},
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
		'tools.ozone.safelink.queryEvents': mainSchema;
	}
}
