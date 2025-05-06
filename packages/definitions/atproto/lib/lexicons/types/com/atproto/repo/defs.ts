import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _commitMetaSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.defs#commitMeta')),
	cid: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.tidString(),
});

type commitMeta$schematype = typeof _commitMetaSchema;

/** @deprecated */
export interface commitMeta$schema extends commitMeta$schematype {}

export const commitMetaSchema = _commitMetaSchema as commitMeta$schema;

export interface CommitMeta extends v.InferInput<typeof commitMetaSchema> {}
