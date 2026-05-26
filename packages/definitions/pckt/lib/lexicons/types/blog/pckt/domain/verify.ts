import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('blog.pckt.domain.verify', {
	params: /*#__PURE__*/ v.object({
		/** AT-URI of the publication record. Authority MUST match the caller's DID. */
		blog: /*#__PURE__*/ v.resourceUriString(),
	}),
	input: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			message: /*#__PURE__*/ v.string(),
			verified: /*#__PURE__*/ v.boolean(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'blog.pckt.domain.verify': mainSchema;
	}
}
