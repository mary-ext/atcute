import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _blobSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp.defs#blob')),
	get lastCommit() {
		return commitSchema;
	},
	mode: /*#__PURE__*/ v.string(),
	/** The file name */
	name: /*#__PURE__*/ v.string(),
	/** File size in bytes */
	size: /*#__PURE__*/ v.integer(),
	/** Submodule information if path is a submodule */
	get submodule() {
		return /*#__PURE__*/ v.optional(submoduleSchema);
	},
});
const _branchSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp.defs#branch')),
	/** hydrated commit object */
	get commit() {
		return commitSchema;
	},
	/** branch name */
	name: /*#__PURE__*/ v.string(),
});
const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp.defs#commit')),
	get author() {
		return signatureSchema;
	},
	get committer() {
		return signatureSchema;
	},
	get hash() {
		return hashSchema;
	},
	message: /*#__PURE__*/ v.string(),
	get tree() {
		return hashSchema;
	},
});
const _hashSchema = /*#__PURE__*/ v.string();
const _signatureSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp.defs#signature')),
	/** Person email */
	email: /*#__PURE__*/ v.string(),
	/** Person name */
	name: /*#__PURE__*/ v.string(),
	/** Timestamp of the signature */
	when: /*#__PURE__*/ v.datetimeString(),
});
const _submoduleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp.defs#submodule')),
	/** Branch to track in the submodule */
	branch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Submodule name */
	name: /*#__PURE__*/ v.string(),
	/** Submodule repository URL */
	url: /*#__PURE__*/ v.string(),
});
const _tagSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp.defs#tag')),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** tag name */
	name: /*#__PURE__*/ v.string(),
	get tagger() {
		return signatureSchema;
	},
	target: /*#__PURE__*/ v.unknown(),
});

type blob$schematype = typeof _blobSchema;
type branch$schematype = typeof _branchSchema;
type commit$schematype = typeof _commitSchema;
type hash$schematype = typeof _hashSchema;
type signature$schematype = typeof _signatureSchema;
type submodule$schematype = typeof _submoduleSchema;
type tag$schematype = typeof _tagSchema;

export interface blobSchema extends blob$schematype {}
export interface branchSchema extends branch$schematype {}
export interface commitSchema extends commit$schematype {}
export interface hashSchema extends hash$schematype {}
export interface signatureSchema extends signature$schematype {}
export interface submoduleSchema extends submodule$schematype {}
export interface tagSchema extends tag$schematype {}

export const blobSchema = _blobSchema as blobSchema;
export const branchSchema = _branchSchema as branchSchema;
export const commitSchema = _commitSchema as commitSchema;
export const hashSchema = _hashSchema as hashSchema;
export const signatureSchema = _signatureSchema as signatureSchema;
export const submoduleSchema = _submoduleSchema as submoduleSchema;
export const tagSchema = _tagSchema as tagSchema;

export interface Blob extends v.InferInput<typeof blobSchema> {}
export interface Branch extends v.InferInput<typeof branchSchema> {}
export interface Commit extends v.InferInput<typeof commitSchema> {}
export type Hash = v.InferInput<typeof hashSchema>;
export interface Signature extends v.InferInput<typeof signatureSchema> {}
export interface Submodule extends v.InferInput<typeof submoduleSchema> {}
export interface Tag extends v.InferInput<typeof tagSchema> {}
