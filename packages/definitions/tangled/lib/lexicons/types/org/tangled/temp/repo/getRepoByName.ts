import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledRepoDefs from '../../repo/defs.ts';

const _gitInfoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.repo.getRepoByName#gitInfo')),
	/** Default branch name from `org.tangled.git.refs/self` record. */
	defaultBranch: /*#__PURE__*/ v.string(),
	/** True if `refs` in `org.tangled.git.refs/self` record is empty. */
	isEmpty: /*#__PURE__*/ v.boolean(),
	/**
	 * Languages on the default branch ordered by size, largest first. Absent until the mirror has indexed the
	 * repo.
	 */
	get languages() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(OrgTangledRepoDefs.languageSchema));
	},
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.repo.getRepoByName', {
	params: /*#__PURE__*/ v.object({
		/** Name of the repo as it appears in its url. */
		name: /*#__PURE__*/ v.string(),
		/** DID of the account that owns the repo. */
		owner: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			get git() {
				return /*#__PURE__*/ v.optional(gitInfoSchema);
			},
			/**
			 * Host of the knot named by the #tangled_knot service in the repo's DID document. Absent when it names
			 * none.
			 */
			knot: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			uri: /*#__PURE__*/ v.resourceUriString(),
			/** Embedded org.tangled.repo.manifest record. */
			value: /*#__PURE__*/ v.unknown(),
		}),
	},
});

type gitInfo$schematype = typeof _gitInfoSchema;
type main$schematype = typeof _mainSchema;

export interface gitInfoSchema extends gitInfo$schematype {}
export interface mainSchema extends main$schematype {}

export const gitInfoSchema = _gitInfoSchema as gitInfoSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface GitInfo extends v.InferInput<typeof gitInfoSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.repo.getRepoByName': mainSchema;
	}
}
