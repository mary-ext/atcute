import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitDefs from '../../git/defs.ts';

const _branchInfoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.git.listBranches#branchInfo')),
	get author() {
		return OrgTangledGitDefs.signatureSchema;
	},
	get committer() {
		return OrgTangledGitDefs.signatureSchema;
	},
	/** Latest commit message */
	message: /*#__PURE__*/ v.string(),
	/** Branch name */
	name: /*#__PURE__*/ v.string(),
	/** Latest commit oid on this branch */
	oid: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.git.listBranches', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of branches to return
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get branches() {
				return /*#__PURE__*/ v.array(branchInfoSchema);
			},
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Name of the default branch */
			defaultBranch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Total number of branches in the repository */
			total: /*#__PURE__*/ v.integer(),
		}),
	},
});

type branchInfo$schematype = typeof _branchInfoSchema;
type main$schematype = typeof _mainSchema;

export interface branchInfoSchema extends branchInfo$schematype {}
export interface mainSchema extends main$schematype {}

export const branchInfoSchema = _branchInfoSchema as branchInfoSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface BranchInfo extends v.InferInput<typeof branchInfoSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.git.listBranches': mainSchema;
	}
}
