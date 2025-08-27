import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.hiddenRef', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			forkRef: /*#__PURE__*/ v.string(),
			remoteRef: /*#__PURE__*/ v.string(),
			repo: /*#__PURE__*/ v.resourceUriString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			success: /*#__PURE__*/ v.boolean(),
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
		'sh.tangled.repo.hiddenRef': mainSchema;
	}
}
