import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.merge', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Author email for the merge commit
			 */
			authorEmail: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Author name for the merge commit
			 */
			authorName: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Target branch to merge into
			 */
			branch: /*#__PURE__*/ v.string(),
			/**
			 * Additional commit message body
			 */
			commitBody: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Merge commit message
			 */
			commitMessage: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * DID of the repository owner
			 */
			did: /*#__PURE__*/ v.didString(),
			/**
			 * Name of the repository
			 */
			name: /*#__PURE__*/ v.string(),
			/**
			 * Patch content to merge
			 */
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
