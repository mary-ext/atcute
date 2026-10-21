import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneSafelinkDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.safelink.syncSource', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get rules() {
				return /*#__PURE__*/ v.array(sourceRuleSchema);
			},
			/**
			 * Source whose rules are being synchronized
			 *
			 * @maxLength 128
			 */
			source: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 128)]),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			added: /*#__PURE__*/ v.integer(),
			events: /*#__PURE__*/ v.integer(),
			removed: /*#__PURE__*/ v.integer(),
			updated: /*#__PURE__*/ v.integer(),
		}),
	},
});
const _sourceRuleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.safelink.syncSource#sourceRule')),
	get action() {
		return ToolsOzoneSafelinkDefs.actionTypeSchema;
	},
	get pattern() {
		return ToolsOzoneSafelinkDefs.patternTypeSchema;
	},
	get reason() {
		return ToolsOzoneSafelinkDefs.reasonTypeSchema;
	},
	url: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;
type sourceRule$schematype = typeof _sourceRuleSchema;

export interface mainSchema extends main$schematype {}
export interface sourceRuleSchema extends sourceRule$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const sourceRuleSchema = _sourceRuleSchema as sourceRuleSchema;

export interface SourceRule extends v.InferInput<typeof sourceRuleSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.safelink.syncSource': mainSchema;
	}
}
