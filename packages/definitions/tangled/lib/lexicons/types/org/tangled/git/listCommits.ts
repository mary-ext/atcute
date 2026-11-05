import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.git.listCommits', {
	params: /*#__PURE__*/ v.object({
		/** Commit Object ID of the last commit in the previous page */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of commits to return in this page
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * Only list commits touching this path
		 *
		 * @default ''
		 */
		path: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), ''),
		/** Git revision (branch, tag, commit Object ID, or full ref name) */
		ref: /*#__PURE__*/ v.string(),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get commits() {
				return /*#__PURE__*/ v.array(OrgTangledGitDefs.commitSchema);
			},
			/** Cursor for the next page, absent when the last page is reached */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'org.tangled.git.listCommits': mainSchema;
	}
}
