import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledGitDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.git.mergeCommit', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Merge commit content. Used when merge commit is created. */
			get mergeCommit() {
				return /*#__PURE__*/ v.optional(mergeCommitContentSchema);
			},
			get source() {
				return sourceSchema;
			},
			style: /*#__PURE__*/ v.literalEnum([
				'fast-forward-only',
				'merge',
				'rebase',
				'rebase-merge',
				'squash-rebase',
				'squash-rebase-merge',
			]),
			get target() {
				return targetSchema;
			},
		}),
	},
	output: null,
});
const _mergeCommitContentSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.mergeCommit#mergeCommitContent')),
	get author() {
		return /*#__PURE__*/ v.optional(ShTangledGitDefs.signatureSchema);
	},
	/** @maxLength 1000000 */
	message: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1000000)]),
	),
});
const _sourceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.mergeCommit#source')),
	/** Head commit ID to merge */
	commit: /*#__PURE__*/ v.string(),
	/** DID of source git repository */
	repo: /*#__PURE__*/ v.didString(),
});
const _targetSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.mergeCommit#target')),
	/** Target branch to merge into */
	branch: /*#__PURE__*/ v.string(),
	/** Head commit ID of target branch */
	commit: /*#__PURE__*/ v.string(),
	/** DID of target git repository */
	repo: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;
type mergeCommitContent$schematype = typeof _mergeCommitContentSchema;
type source$schematype = typeof _sourceSchema;
type target$schematype = typeof _targetSchema;

export interface mainSchema extends main$schematype {}
export interface mergeCommitContentSchema extends mergeCommitContent$schematype {}
export interface sourceSchema extends source$schematype {}
export interface targetSchema extends target$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const mergeCommitContentSchema = _mergeCommitContentSchema as mergeCommitContentSchema;
export const sourceSchema = _sourceSchema as sourceSchema;
export const targetSchema = _targetSchema as targetSchema;

export interface MergeCommitContent extends v.InferInput<typeof mergeCommitContentSchema> {}
export interface Source extends v.InferInput<typeof sourceSchema> {}
export interface Target extends v.InferInput<typeof targetSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'sh.tangled.git.mergeCommit': mainSchema;
	}
}
