import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.repo.uploadBlob', {
	params: null,
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

export interface $params {}
export type $input = v.InferXRPCBodyInput<mainSchema['input']>;
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.repo.uploadBlob': mainSchema;
	}
}
