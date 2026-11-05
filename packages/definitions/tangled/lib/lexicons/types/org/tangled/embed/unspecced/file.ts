import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitOid from '../../git/oid.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.embed.unspecced.file')),
	get commit() {
		return OrgTangledGitOid.mainSchema;
	},
	path: /*#__PURE__*/ v.string(),
	repo: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
