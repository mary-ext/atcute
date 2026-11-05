import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.ci.trigger.manual')),
	/**
	 * Commit id the pipeline will run on.
	 *
	 * @minLength 40
	 * @maxLength 64
	 */
	commit: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 64)]),
	get inputs() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(pairSchema));
	},
	/** Optional ref the commit was resolved from. */
	ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	repo: /*#__PURE__*/ v.didString(),
	/** Workflow names to run. When not provided, every dispatchable workflow is run. */
	workflows: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
});
const _pairSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.ci.trigger.manual#pair')),
	key: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;
type pair$schematype = typeof _pairSchema;

export interface mainSchema extends main$schematype {}
export interface pairSchema extends pair$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const pairSchema = _pairSchema as pairSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Pair extends v.InferInput<typeof pairSchema> {}
