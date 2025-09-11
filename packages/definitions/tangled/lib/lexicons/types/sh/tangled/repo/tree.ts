import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _lastCommitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.tree#lastCommit')),
	hash: /*#__PURE__*/ v.string(),
	message: /*#__PURE__*/ v.string(),
	when: /*#__PURE__*/ v.datetimeString(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.tree', {
	params: /*#__PURE__*/ v.object({
		path: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), ''),
		ref: /*#__PURE__*/ v.string(),
		repo: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			dotdot: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get files() {
				return /*#__PURE__*/ v.array(treeEntrySchema);
			},
			parent: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			ref: /*#__PURE__*/ v.string(),
		}),
	},
});
const _treeEntrySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.tree#treeEntry')),
	is_file: /*#__PURE__*/ v.boolean(),
	is_subtree: /*#__PURE__*/ v.boolean(),
	get last_commit() {
		return /*#__PURE__*/ v.optional(lastCommitSchema);
	},
	mode: /*#__PURE__*/ v.string(),
	name: /*#__PURE__*/ v.string(),
	size: /*#__PURE__*/ v.integer(),
});

type lastCommit$schematype = typeof _lastCommitSchema;
type main$schematype = typeof _mainSchema;
type treeEntry$schematype = typeof _treeEntrySchema;

export interface lastCommitSchema extends lastCommit$schematype {}
export interface mainSchema extends main$schematype {}
export interface treeEntrySchema extends treeEntry$schematype {}

export const lastCommitSchema = _lastCommitSchema as lastCommitSchema;
export const mainSchema = _mainSchema as mainSchema;
export const treeEntrySchema = _treeEntrySchema as treeEntrySchema;

export interface LastCommit extends v.InferInput<typeof lastCommitSchema> {}
export interface TreeEntry extends v.InferInput<typeof treeEntrySchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.repo.tree': mainSchema;
	}
}
