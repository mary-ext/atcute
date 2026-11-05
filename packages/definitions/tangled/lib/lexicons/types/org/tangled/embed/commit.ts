import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitOid from '../git/oid.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.embed.commit')),
	get commit() {
		return OrgTangledGitOid.mainSchema;
	},
	repo: /*#__PURE__*/ v.didString(),
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.embed.commit#view')),
	/** @maxLength 32 */
	change: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 32)]),
	),
	/** @maxLength 64 */
	commit: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 64)]),
	repo: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;

export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
