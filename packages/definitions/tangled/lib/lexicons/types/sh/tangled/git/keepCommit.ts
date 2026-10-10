import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.keepCommit#commit')),
	/**
	 * @minLength 40
	 * @maxLength 128
	 */
	oid: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 128)]),
	repo: /*#__PURE__*/ v.didString(),
});
const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.git.keepCommit', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** at-uri of target record. rkey is required */
			record: /*#__PURE__*/ v.resourceUriString(),
			repo: /*#__PURE__*/ v.didString(),
			get source() {
				return /*#__PURE__*/ v.variant([commitSchema, patchesSchema]);
			},
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * @minLength 40
			 * @maxLength 128
			 */
			commit: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 128)]),
		}),
	},
});
const _patchesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.keepCommit#patches')),
	patches: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});

type commit$schematype = typeof _commitSchema;
type main$schematype = typeof _mainSchema;
type patches$schematype = typeof _patchesSchema;

export interface commitSchema extends commit$schematype {}
export interface mainSchema extends main$schematype {}
export interface patchesSchema extends patches$schematype {}

export const commitSchema = _commitSchema as commitSchema;
export const mainSchema = _mainSchema as mainSchema;
export const patchesSchema = _patchesSchema as patchesSchema;

export interface Commit extends v.InferInput<typeof commitSchema> {}
export interface Patches extends v.InferInput<typeof patchesSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'sh.tangled.git.keepCommit': mainSchema;
	}
}
