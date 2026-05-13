import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.pipeline.cancelPipeline', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** pipeline at-uri */
			pipeline: /*#__PURE__*/ v.resourceUriString(),
			/** repo at-uri, spindle can't resolve repo from pipeline at-uri yet */
			repo: /*#__PURE__*/ v.resourceUriString(),
			/** workflow name */
			workflow: /*#__PURE__*/ v.string(),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'sh.tangled.pipeline.cancelPipeline': mainSchema;
	}
}
