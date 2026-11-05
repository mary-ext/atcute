import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.event.pullRequest')),
	/** The pull request lifecycle action that produced this trigger. */
	action: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literalEnum(['closed', 'merged', 'opened', 'reopened', 'synchronize']),
	),
	/** AT-URI of the pull request record this run belongs to. */
	pull: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	sourceBranch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Repository DID to check out code and workflow definitions from, if different from the target repo. */
	sourceRepo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	/**
	 * Commit id of the pull request head.
	 *
	 * @minLength 40
	 * @maxLength 64
	 */
	sourceSha: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 64)]),
	),
	targetBranch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
