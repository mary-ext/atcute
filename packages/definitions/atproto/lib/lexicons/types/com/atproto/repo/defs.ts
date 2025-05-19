import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _commitMetaSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.defs#commitMeta')),
	cid: /*#__PURE__*/ v.cidString(),
	rev: /*#__PURE__*/ v.tidString(),
});

type commitMeta$schematype = typeof _commitMetaSchema;

export interface commitMetaSchema extends commitMeta$schematype {}

export const commitMetaSchema = _commitMetaSchema as commitMetaSchema;

export interface CommitMeta extends v.InferInput<typeof commitMetaSchema> {}
