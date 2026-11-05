import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.git.getDiff', {
	params: /*#__PURE__*/ v.object({
		/** Base revision (branch, tag, or commit Object ID) */
		base: /*#__PURE__*/ v.string(),
		/** Head revision (branch, tag, or commit Object ID) */
		head: /*#__PURE__*/ v.string(),
		/** Only include diffs touching these paths, comma-separated */
		paths: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get diffs() {
				return /*#__PURE__*/ v.array(OrgTangledGitDefs.fileDiffSchema);
			},
			get stats() {
				return /*#__PURE__*/ v.optional(OrgTangledGitDefs.diffStatSchema);
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
		'org.tangled.git.getDiff': mainSchema;
	}
}
