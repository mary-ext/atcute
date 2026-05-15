import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _lastCommitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.blob#lastCommit')),
	get author() {
		return /*#__PURE__*/ v.optional(signatureSchema);
	},
	/** Commit hash */
	hash: /*#__PURE__*/ v.string(),
	/** Commit message */
	message: /*#__PURE__*/ v.string(),
	/** Commit timestamp */
	when: /*#__PURE__*/ v.datetimeString(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.blob', {
	params: /*#__PURE__*/ v.object({
		/** Path to the file within the repository */
		path: /*#__PURE__*/ v.string(),
		/**
		 * Return raw file content instead of JSON response
		 *
		 * @default false
		 */
		raw: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		/** Git reference (branch, tag, or commit SHA) */
		ref: /*#__PURE__*/ v.string(),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** File content (base64 encoded for binary files) */
			content: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Content encoding */
			encoding: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['base64', 'utf-8'])),
			fileTooLarge: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/** Whether the file is binary */
			isBinary: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			get lastCommit() {
				return /*#__PURE__*/ v.optional(lastCommitSchema);
			},
			/** MIME type of the file */
			mimeType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** The file path */
			path: /*#__PURE__*/ v.string(),
			/** The git reference used */
			ref: /*#__PURE__*/ v.string(),
			/** File size in bytes */
			size: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** Submodule information if path is a submodule */
			get submodule() {
				return /*#__PURE__*/ v.optional(submoduleSchema);
			},
		}),
	},
});
const _signatureSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.blob#signature')),
	/** Author email */
	email: /*#__PURE__*/ v.string(),
	/** Author name */
	name: /*#__PURE__*/ v.string(),
	/** Author timestamp */
	when: /*#__PURE__*/ v.datetimeString(),
});
const _submoduleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.blob#submodule')),
	/** Branch to track in the submodule */
	branch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Submodule name */
	name: /*#__PURE__*/ v.string(),
	/** Submodule repository URL */
	url: /*#__PURE__*/ v.string(),
});

type lastCommit$schematype = typeof _lastCommitSchema;
type main$schematype = typeof _mainSchema;
type signature$schematype = typeof _signatureSchema;
type submodule$schematype = typeof _submoduleSchema;

export interface lastCommitSchema extends lastCommit$schematype {}
export interface mainSchema extends main$schematype {}
export interface signatureSchema extends signature$schematype {}
export interface submoduleSchema extends submodule$schematype {}

export const lastCommitSchema = _lastCommitSchema as lastCommitSchema;
export const mainSchema = _mainSchema as mainSchema;
export const signatureSchema = _signatureSchema as signatureSchema;
export const submoduleSchema = _submoduleSchema as submoduleSchema;

export interface LastCommit extends v.InferInput<typeof lastCommitSchema> {}
export interface Signature extends v.InferInput<typeof signatureSchema> {}
export interface Submodule extends v.InferInput<typeof submoduleSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.repo.blob': mainSchema;
	}
}
