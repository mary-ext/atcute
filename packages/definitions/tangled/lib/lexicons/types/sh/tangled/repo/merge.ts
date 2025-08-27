import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.merge', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			authorEmail: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			authorName: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			branch: /*#__PURE__*/ v.string(),
			commitBody: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			commitMessage: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			did: /*#__PURE__*/ v.didString(),
			name: /*#__PURE__*/ v.string(),
			patch: /*#__PURE__*/ v.string(),
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
		'sh.tangled.repo.merge': mainSchema;
	}
}
