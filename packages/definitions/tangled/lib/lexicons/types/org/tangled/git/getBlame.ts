import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _authorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.getBlame#author')),
	email: /*#__PURE__*/ v.string(),
	name: /*#__PURE__*/ v.string(),
});
const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.getBlame#commit')),
	get author() {
		return authorSchema;
	},
	/** When the change was authored */
	authoredAt: /*#__PURE__*/ v.datetimeString(),
	/** Commit Object ID */
	sha: /*#__PURE__*/ v.string(),
	/** First line of the commit message */
	subject: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.git.getBlame', {
	params: /*#__PURE__*/ v.object({
		/** Path of the file to blame */
		path: /*#__PURE__*/ v.string(),
		/** Git revision (branch, tag, or commit Object ID) */
		ref: /*#__PURE__*/ v.string(),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** The resolved commit Object ID */
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
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.getBlame#run')),
	/** The commit Object ID of the entry in commits this run is attributed to */
	commit: /*#__PURE__*/ v.string(),
	/**
	 * Number of lines in the run
	 *
	 * @minimum 1
	 */
	count: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/**
	 * First line of the run, one-based
	 *
	 * @minimum 1
	 */
	start: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});

type author$schematype = typeof _authorSchema;
type commit$schematype = typeof _commitSchema;
type main$schematype = typeof _mainSchema;
type run$schematype = typeof _runSchema;

export interface authorSchema extends author$schematype {}
export interface commitSchema extends commit$schematype {}
export interface mainSchema extends main$schematype {}
export interface runSchema extends run$schematype {}

export const authorSchema = _authorSchema as authorSchema;
export const commitSchema = _commitSchema as commitSchema;
export const mainSchema = _mainSchema as mainSchema;
export const runSchema = _runSchema as runSchema;

export interface Author extends v.InferInput<typeof authorSchema> {}
export interface Commit extends v.InferInput<typeof commitSchema> {}
export interface Run extends v.InferInput<typeof runSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.git.getBlame': mainSchema;
	}
}
