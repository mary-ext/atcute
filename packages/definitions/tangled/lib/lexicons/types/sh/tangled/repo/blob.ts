import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _lastCommitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.blob#lastCommit')),
	get author() {
		return /*#__PURE__*/ v.optional(signatureSchema);
	},
	hash: /*#__PURE__*/ v.string(),
	message: /*#__PURE__*/ v.string(),
	shortHash: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	when: /*#__PURE__*/ v.datetimeString(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.blob', {
	params: /*#__PURE__*/ v.object({
		path: /*#__PURE__*/ v.string(),
		raw: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		ref: /*#__PURE__*/ v.string(),
		repo: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			content: /*#__PURE__*/ v.string(),
			encoding: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['base64', 'utf-8'])),
			isBinary: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			get lastCommit() {
				return /*#__PURE__*/ v.optional(lastCommitSchema);
			},
			mimeType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			path: /*#__PURE__*/ v.string(),
			ref: /*#__PURE__*/ v.string(),
			size: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		}),
	},
});
const _signatureSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.blob#signature')),
	email: /*#__PURE__*/ v.string(),
	name: /*#__PURE__*/ v.string(),
	when: /*#__PURE__*/ v.datetimeString(),
});

type lastCommit$schematype = typeof _lastCommitSchema;
type main$schematype = typeof _mainSchema;
type signature$schematype = typeof _signatureSchema;

export interface lastCommitSchema extends lastCommit$schematype {}
export interface mainSchema extends main$schematype {}
export interface signatureSchema extends signature$schematype {}

export const lastCommitSchema = _lastCommitSchema as lastCommitSchema;
export const mainSchema = _mainSchema as mainSchema;
export const signatureSchema = _signatureSchema as signatureSchema;

export interface LastCommit extends v.InferInput<typeof lastCommitSchema> {}
export interface Signature extends v.InferInput<typeof signatureSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.repo.blob': mainSchema;
	}
}
