import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _limitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.spindle.quota.defs#limit')),
	/** DID whose quota is overridden, either a repository or an account owner */
	did: /*#__PURE__*/ v.didString(),
	/** maximum amount in the resource's native units; -1 means unlimited */
	limit: /*#__PURE__*/ v.integer(),
	/** quota resource name */
	resource: /*#__PURE__*/ v.string(),
});
const _usageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.spindle.quota.defs#usage')),
	/** DID for the user or repository scope */
	did: /*#__PURE__*/ v.didString(),
	/** quota resource name */
	resource: /*#__PURE__*/ v.string(),
	/** aggregation axis for this row: user or repo */
	scope: /*#__PURE__*/ v.string<'repo' | 'user' | (string & {})>(),
	/** amount currently allocated or reserved in native resource units */
	used: /*#__PURE__*/ v.integer(),
});

type limit$schematype = typeof _limitSchema;
type usage$schematype = typeof _usageSchema;

export interface limitSchema extends limit$schematype {}
export interface usageSchema extends usage$schematype {}

export const limitSchema = _limitSchema as limitSchema;
export const usageSchema = _usageSchema as usageSchema;

export interface Limit extends v.InferInput<typeof limitSchema> {}
export interface Usage extends v.InferInput<typeof usageSchema> {}
