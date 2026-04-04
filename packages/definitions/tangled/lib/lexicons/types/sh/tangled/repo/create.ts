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
			 * Name of the repository
			 */
			name: /*#__PURE__*/ v.string(),
			/**
			 * Optional user-provided did:web to use as the repo identity instead of minting a did:plc.
			 */
			repoDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
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
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			repoDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
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
		'sh.tangled.repo.create': mainSchema;
	}
}
