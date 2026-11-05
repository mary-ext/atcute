import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.git.getTree', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Path within the repository tree
		 *
		 * @default ''
		 */
		path: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), ''),
		/**
		 * Git revision (branch, tag, or commit Object ID)
		 *
		 * @default 'HEAD'
		 */
		ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'HEAD'),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get entries() {
				return /*#__PURE__*/ v.array(treeEntrySchema);
			},
			get lastCommit() {
				return /*#__PURE__*/ v.optional(OrgTangledGitDefs.commitSchema);
			},
		}),
	},
});
const _treeEntrySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.getTree#treeEntry')),
	get lastCommit() {
		return /*#__PURE__*/ v.optional(OrgTangledGitDefs.commitSchema);
	},
	/** File mode */
	mode: /*#__PURE__*/ v.literalEnum(['0040000', '0100644', '0100755', '0120000', '0160000']),
	/** Relative file or directory name */
	name: /*#__PURE__*/ v.string(),
	/** File size in bytes */
	size: /*#__PURE__*/ v.integer(),
});

type main$schematype = typeof _mainSchema;
type treeEntry$schematype = typeof _treeEntrySchema;

export interface mainSchema extends main$schematype {}
export interface treeEntrySchema extends treeEntry$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const treeEntrySchema = _treeEntrySchema as treeEntrySchema;

export interface TreeEntry extends v.InferInput<typeof treeEntrySchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.git.getTree': mainSchema;
	}
}
