import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneSafelinkDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.safelink.addRule', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get action() {
				return ToolsOzoneSafelinkDefs.actionTypeSchema;
			},
			comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			createdBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			get pattern() {
				return ToolsOzoneSafelinkDefs.patternTypeSchema;
			},
			get reason() {
				return ToolsOzoneSafelinkDefs.reasonTypeSchema;
			},
			url: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneSafelinkDefs.eventSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.safelink.addRule': mainSchema;
	}
}
