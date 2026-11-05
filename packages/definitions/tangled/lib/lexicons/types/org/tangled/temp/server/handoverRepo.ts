import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.server.handoverRepo', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			fosterUrl: /*#__PURE__*/ v.genericUriString(),
			repoDid: /*#__PURE__*/ v.didString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			repoDid: /*#__PURE__*/ v.didString(),
			state: /*#__PURE__*/ v.string<'running' | (string & {})>(),
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
		'org.tangled.temp.server.handoverRepo': mainSchema;
	}
}
