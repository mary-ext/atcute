import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.ci.trigger.schedule')),
	/**
	 * Commit id the pipeline ran on, the head of ref at dispatch.
	 *
	 * @minLength 40
	 * @maxLength 64
	 */
	commit: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 64)]),
	/** Branch the commit was resolved from, the repository's default branch. */
	ref: /*#__PURE__*/ v.string(),
	repo: /*#__PURE__*/ v.didString(),
	/** The schedule tick this run is for, to the minute. */
	scheduledAt: /*#__PURE__*/ v.datetimeString(),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
