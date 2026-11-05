import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _byteChangesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.defs#byteChanges')),
	/** @minimum 0 */
	lhs: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	rhs: /*#__PURE__*/ v.integer(),
});
const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.defs#commit')),
	get author() {
		return signatureSchema;
	},
	get committer() {
		return signatureSchema;
	},
	/** Commit Object ID */
	hash: /*#__PURE__*/ v.string(),
	message: /*#__PURE__*/ v.string(),
	/** Tree Object ID */
	tree: /*#__PURE__*/ v.string(),
});
const _diffHunkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.defs#diffHunk')),
	get lines() {
		return /*#__PURE__*/ v.array(linePairSchema);
	},
	/** 0-based line numbers holding novel content on the left side */
	novelLhs: /*#__PURE__*/ v.array(/*#__PURE__*/ v.integer()),
	/** 0-based line numbers holding novel content on the right side */
	novelRhs: /*#__PURE__*/ v.array(/*#__PURE__*/ v.integer()),
});
const _diffSrcSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.defs#diffSrc')),
	/** Inlined content. Used on interdiff's LHS. */
	content: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	isBinary: /*#__PURE__*/ v.boolean(),
	isSubmodule: /*#__PURE__*/ v.boolean(),
	/** Blob oid, or the commit oid for a submodule */
	oid: /*#__PURE__*/ v.string(),
	path: /*#__PURE__*/ v.string(),
	/** @minimum 0 */
	size: /*#__PURE__*/ v.integer(),
});
const _diffStatSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.defs#diffStat')),
	/** @minimum 0 */
	deletions: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	filesChanged: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	insertions: /*#__PURE__*/ v.integer(),
});
const _fileDiffSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.defs#fileDiff')),
	/** Byte count per side, present only when the two sides differ */
	get hasByteChanges() {
		return /*#__PURE__*/ v.optional(byteChangesSchema);
	},
	hasSyntacticChanges: /*#__PURE__*/ v.boolean(),
	get hunks() {
		return /*#__PURE__*/ v.array(diffHunkSchema);
	},
	get lhsSrc() {
		return diffSrcSchema;
	},
	get rhsSrc() {
		return diffSrcSchema;
	},
});
const _linePairSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.defs#linePair')),
	/** @minimum 0 */
	lhs: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/** @minimum 0 */
	rhs: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _signatureSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.defs#signature')),
	/** Person email */
	email: /*#__PURE__*/ v.string(),
	/** Person name */
	name: /*#__PURE__*/ v.string(),
	/** Timestamp of the signature */
	when: /*#__PURE__*/ v.datetimeString(),
});
const _submoduleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.defs#submodule')),
	/** Branch to track in the submodule */
	branch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Submodule name */
	name: /*#__PURE__*/ v.string(),
	/** Submodule repository URL */
	url: /*#__PURE__*/ v.string(),
});

type byteChanges$schematype = typeof _byteChangesSchema;
type commit$schematype = typeof _commitSchema;
type diffHunk$schematype = typeof _diffHunkSchema;
type diffSrc$schematype = typeof _diffSrcSchema;
type diffStat$schematype = typeof _diffStatSchema;
type fileDiff$schematype = typeof _fileDiffSchema;
type linePair$schematype = typeof _linePairSchema;
type signature$schematype = typeof _signatureSchema;
type submodule$schematype = typeof _submoduleSchema;

export interface byteChangesSchema extends byteChanges$schematype {}
export interface commitSchema extends commit$schematype {}
export interface diffHunkSchema extends diffHunk$schematype {}
export interface diffSrcSchema extends diffSrc$schematype {}
export interface diffStatSchema extends diffStat$schematype {}
export interface fileDiffSchema extends fileDiff$schematype {}
export interface linePairSchema extends linePair$schematype {}
export interface signatureSchema extends signature$schematype {}
export interface submoduleSchema extends submodule$schematype {}

export const byteChangesSchema = _byteChangesSchema as byteChangesSchema;
export const commitSchema = _commitSchema as commitSchema;
export const diffHunkSchema = _diffHunkSchema as diffHunkSchema;
export const diffSrcSchema = _diffSrcSchema as diffSrcSchema;
export const diffStatSchema = _diffStatSchema as diffStatSchema;
export const fileDiffSchema = _fileDiffSchema as fileDiffSchema;
export const linePairSchema = _linePairSchema as linePairSchema;
export const signatureSchema = _signatureSchema as signatureSchema;
export const submoduleSchema = _submoduleSchema as submoduleSchema;

export interface ByteChanges extends v.InferInput<typeof byteChangesSchema> {}
export interface Commit extends v.InferInput<typeof commitSchema> {}
export interface DiffHunk extends v.InferInput<typeof diffHunkSchema> {}
export interface DiffSrc extends v.InferInput<typeof diffSrcSchema> {}
export interface DiffStat extends v.InferInput<typeof diffStatSchema> {}
export interface FileDiff extends v.InferInput<typeof fileDiffSchema> {}
export interface LinePair extends v.InferInput<typeof linePairSchema> {}
export interface Signature extends v.InferInput<typeof signatureSchema> {}
export interface Submodule extends v.InferInput<typeof submoduleSchema> {}
