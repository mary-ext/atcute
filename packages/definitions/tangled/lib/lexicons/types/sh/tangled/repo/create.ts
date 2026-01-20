import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.create', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Default branch to push to
			 */
			defaultBranch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Rkey of the repository record
			 */
			rkey: /*#__PURE__*/ v.string(),
			/**
			 * A source URL to clone from, populate this when forking or importing a repository.
			 */
			source: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'sh.tangled.repo.create': mainSchema;
	}
}
