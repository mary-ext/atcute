import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.server.uploadBlob', {
	params: /*#__PURE__*/ v.object({
		/** Repo DID hosted on this knot that the blob belongs to. */
		repoDid: /*#__PURE__*/ v.didString(),
	}),
	input: {
		type: 'blob',
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			blob: /*#__PURE__*/ v.blob(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $input = v.InferXRPCBodyInput<mainSchema['input']>;
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.server.uploadBlob': mainSchema;
	}
}
