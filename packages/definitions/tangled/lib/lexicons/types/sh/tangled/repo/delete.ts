import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.delete', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * DID of the repository owner. A knot without the repo-did-input capability reads this and name in
			 * place of repo.
			 */
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/** Admin-only. Delete even though the repository record still exists on the owner's PDS. */
			force: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Name of the repository to delete. A knot without the repo-did-input capability reads this and DID in
			 * place of repo.
			 */
			name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** DID of the repository to delete */
			repo: /*#__PURE__*/ v.didString(),
			/**
			 * Rkey of the repository record. A knot without the repo-did-input capability checks this against the
			 * owner's PDS.
			 */
			rkey: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.recordKeyString()),
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
		'sh.tangled.repo.delete': mainSchema;
	}
}
