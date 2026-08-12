import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _conflictInfoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.mergeCheck#conflictInfo')),
	/** Name of the conflicted file */
	filename: /*#__PURE__*/ v.string(),
	/** Reason for the conflict */
	reason: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.mergeCheck', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Target branch to merge into */
			branch: /*#__PURE__*/ v.string(),
			/**
			 * DID of the repository owner. A knot without the repo-did-input capability reads this and name in
			 * place of repo.
			 */
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/**
			 * Name of the repository. A knot without the repo-did-input capability reads this and DID in place of
			 * repo.
			 */
			name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Patch or pull request to check for merge conflicts */
			patch: /*#__PURE__*/ v.string(),
			/** DID of the repository */
			repo: /*#__PURE__*/ v.didString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** List of files with merge conflicts */
			get conflicts() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(conflictInfoSchema));
			},
			/** Error message if check failed */
			error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Whether the merge has conflicts */
			is_conflicted: /*#__PURE__*/ v.boolean(),
			/** Additional message about the merge check */
			message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});

type conflictInfo$schematype = typeof _conflictInfoSchema;
type main$schematype = typeof _mainSchema;

export interface conflictInfoSchema extends conflictInfo$schematype {}
export interface mainSchema extends main$schematype {}

export const conflictInfoSchema = _conflictInfoSchema as conflictInfoSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface ConflictInfo extends v.InferInput<typeof conflictInfoSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'sh.tangled.repo.mergeCheck': mainSchema;
	}
}
