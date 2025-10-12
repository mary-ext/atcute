import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _lastCommitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.tree#lastCommit')),
	/**
	 * Commit hash
	 */
	hash: /*#__PURE__*/ v.string(),
	/**
	 * Commit message
	 */
	message: /*#__PURE__*/ v.string(),
	/**
	 * Commit timestamp
	 */
	when: /*#__PURE__*/ v.datetimeString(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.tree', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Path within the repository tree
		 * @default ""
		 */
		path: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), ''),
		/**
		 * Git reference (branch, tag, or commit SHA)
		 */
		ref: /*#__PURE__*/ v.string(),
		/**
		 * Repository identifier in format 'did:plc:.../repoName'
		 */
		repo: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Parent directory path
			 */
			dotdot: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get files() {
				return /*#__PURE__*/ v.array(treeEntrySchema);
			},
			/**
			 * The parent path in the tree
			 */
			parent: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Readme for this file tree
			 */
			get readme() {
				return /*#__PURE__*/ v.optional(readmeSchema);
			},
			/**
			 * The git reference used
			 */
			ref: /*#__PURE__*/ v.string(),
		}),
	},
});
const _readmeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.tree#readme')),
	/**
	 * Contents of the readme file
	 */
	contents: /*#__PURE__*/ v.string(),
	/**
	 * Name of the readme file
	 */
	filename: /*#__PURE__*/ v.string(),
});
const _treeEntrySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.tree#treeEntry')),
	/**
	 * Whether this entry is a file
	 */
	is_file: /*#__PURE__*/ v.boolean(),
	/**
	 * Whether this entry is a directory/subtree
	 */
	is_subtree: /*#__PURE__*/ v.boolean(),
	get last_commit() {
		return /*#__PURE__*/ v.optional(lastCommitSchema);
	},
	/**
	 * File mode
	 */
	mode: /*#__PURE__*/ v.string(),
	/**
	 * Relative file or directory name
	 */
	name: /*#__PURE__*/ v.string(),
	/**
	 * File size in bytes
	 */
	size: /*#__PURE__*/ v.integer(),
});

type lastCommit$schematype = typeof _lastCommitSchema;
type main$schematype = typeof _mainSchema;
type readme$schematype = typeof _readmeSchema;
type treeEntry$schematype = typeof _treeEntrySchema;

export interface lastCommitSchema extends lastCommit$schematype {}
export interface mainSchema extends main$schematype {}
export interface readmeSchema extends readme$schematype {}
export interface treeEntrySchema extends treeEntry$schematype {}

export const lastCommitSchema = _lastCommitSchema as lastCommitSchema;
export const mainSchema = _mainSchema as mainSchema;
export const readmeSchema = _readmeSchema as readmeSchema;
export const treeEntrySchema = _treeEntrySchema as treeEntrySchema;

export interface LastCommit extends v.InferInput<typeof lastCommitSchema> {}
export interface Readme extends v.InferInput<typeof readmeSchema> {}
export interface TreeEntry extends v.InferInput<typeof treeEntrySchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.repo.tree': mainSchema;
	}
}
