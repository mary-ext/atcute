import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.forkStatus', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			branch: /*#__PURE__*/ v.string(),
			did: /*#__PURE__*/ v.didString(),
			hiddenRef: /*#__PURE__*/ v.string(),
			name: /*#__PURE__*/ v.string(),
			source: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			status: /*#__PURE__*/ v.integer(),
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
		'sh.tangled.repo.forkStatus': mainSchema;
	}
}
