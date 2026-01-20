import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneSetDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.set.upsertSet', {
	params: null,
	input: {
		type: 'lex',
		get schema() {
			return ToolsOzoneSetDefs.setSchema;
		},
	},
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneSetDefs.setViewSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export type $input = v.InferXRPCBodyInput<mainSchema['input']>;
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.set.upsertSet': mainSchema;
	}
}
