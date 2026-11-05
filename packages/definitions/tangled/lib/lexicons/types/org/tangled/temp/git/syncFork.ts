import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.git.syncFork', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			branch: /*#__PURE__*/ v.string(),
			/** DID of the fork repository */
			repo: /*#__PURE__*/ v.didString(),
			/** DID of the upstream repository */
			source: /*#__PURE__*/ v.didString(),
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
		'org.tangled.temp.git.syncFork': mainSchema;
	}
}
