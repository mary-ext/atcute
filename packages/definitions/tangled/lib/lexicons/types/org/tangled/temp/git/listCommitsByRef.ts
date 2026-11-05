import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTempGitListCommits from './listCommits.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.git.listCommitsByRef', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Diff each commit against its first parent and include a line stat
		 *
		 * @default false
		 */
		includeStats: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		/**
		 * Maximum number of commits to return
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		ranges: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
		/**
		 * Number of matching commits to skip. A poor man's pagination.
		 *
		 * @default 0
		 * @minimum 0
		 */
		skip: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 0),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get commits() {
				return /*#__PURE__*/ v.array(OrgTangledTempGitListCommits.commitSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.git.listCommitsByRef': mainSchema;
	}
}
