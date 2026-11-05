import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledGitDefs from '../defs.ts';

const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp2.getBlame#commit')),
	get author() {
		return ShTangledGitDefs.signatureSchema;
	},
	/** Full commit message */
	message: /*#__PURE__*/ v.string(),
	oid: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp2.getBlame', {
	params: /*#__PURE__*/ v.object({
		/** Path to the file within the repository */
		path: /*#__PURE__*/ v.string(),
		/** Revspec to blame at: a branch, tag, or commit sha */
		ref: /*#__PURE__*/ v.string(),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** The resolved git commit object id */
			commit: /*#__PURE__*/ v.string(),
			/** Unique commits referenced by blame runs */
			get commits() {
				return /*#__PURE__*/ v.array(commitSchema);
			},
			/** Complete, gap-free one-based line ranges sorted by start */
			get runs() {
				return /*#__PURE__*/ v.array(runSchema);
			},
		}),
	},
});
const _runSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp2.getBlame#run')),
	/** oid of a commit in the output commits array */
	commit: /*#__PURE__*/ v.string(),
	/**
	 * Number of consecutive lines in this run
	 *
	 * @minimum 1
	 */
	count: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/**
	 * First one-based line in this run
	 *
	 * @minimum 1
	 */
	start: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});

type commit$schematype = typeof _commitSchema;
type main$schematype = typeof _mainSchema;
type run$schematype = typeof _runSchema;

export interface commitSchema extends commit$schematype {}
export interface mainSchema extends main$schematype {}
export interface runSchema extends run$schematype {}

export const commitSchema = _commitSchema as commitSchema;
export const mainSchema = _mainSchema as mainSchema;
export const runSchema = _runSchema as runSchema;

export interface Commit extends v.InferInput<typeof commitSchema> {}
export interface Run extends v.InferInput<typeof runSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.git.temp2.getBlame': mainSchema;
	}
}
