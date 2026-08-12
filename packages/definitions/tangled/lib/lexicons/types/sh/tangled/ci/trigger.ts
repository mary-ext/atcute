import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _manualSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.ci.trigger#manual')),
	get inputs() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(pairSchema));
	},
	/** optional ref the SHA was resolved from, for display and TANGLED_REF */
	ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * commit SHA the manual run targets
	 *
	 * @minLength 40
	 * @maxLength 40
	 */
	sha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 40)]),
	/** Repository DID to check out code and workflow definitions from, if different from the target repo. */
	sourceRepo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
});
const _pairSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.ci.trigger#pair')),
	key: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});
const _pullRequestSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.ci.trigger#pullRequest')),
	/** the pull request lifecycle action that produced this trigger */
	action: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literalEnum(['closed', 'merged', 'opened', 'reopened', 'synchronize']),
	),
	/** AT-URI of the sh.tangled.repo.pull record this run belongs to */
	pull: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	sourceBranch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Repository DID to check out code and workflow definitions from, if different from the target repo. */
	sourceRepo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	/**
	 * @minLength 40
	 * @maxLength 40
	 */
	sourceSha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 40)]),
	targetBranch: /*#__PURE__*/ v.string(),
});
const _pushSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.ci.trigger#push')),
	/**
	 * @minLength 40
	 * @maxLength 40
	 */
	newSha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 40)]),
	/**
	 * @minLength 40
	 * @maxLength 40
	 */
	oldSha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 40)]),
	ref: /*#__PURE__*/ v.string(),
});

type manual$schematype = typeof _manualSchema;
type pair$schematype = typeof _pairSchema;
type pullRequest$schematype = typeof _pullRequestSchema;
type push$schematype = typeof _pushSchema;

export interface manualSchema extends manual$schematype {}
export interface pairSchema extends pair$schematype {}
export interface pullRequestSchema extends pullRequest$schematype {}
export interface pushSchema extends push$schematype {}

export const manualSchema = _manualSchema as manualSchema;
export const pairSchema = _pairSchema as pairSchema;
export const pullRequestSchema = _pullRequestSchema as pullRequestSchema;
export const pushSchema = _pushSchema as pushSchema;

export interface Manual extends v.InferInput<typeof manualSchema> {}
export interface Pair extends v.InferInput<typeof pairSchema> {}
export interface PullRequest extends v.InferInput<typeof pullRequestSchema> {}
export interface Push extends v.InferInput<typeof pushSchema> {}
