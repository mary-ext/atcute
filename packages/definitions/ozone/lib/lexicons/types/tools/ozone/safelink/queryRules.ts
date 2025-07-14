import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneSafelinkDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.safelink.queryRules', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			actions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			createdBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			limit: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
				50,
			),
			patternType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			reason: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			sortDirection: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<'asc' | 'desc' | (string & {})>(),
				'desc',
			),
			urls: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get rules() {
				return /*#__PURE__*/ v.array(ToolsOzoneSafelinkDefs.urlRuleSchema);
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
		'tools.ozone.safelink.queryRules': mainSchema;
	}
}
