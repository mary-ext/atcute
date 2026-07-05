import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledCiTrigger from './trigger.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.ci.pipeline')),
	/** Commit Id this pipeline is running on */
	commit: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Spindle-local pipeline id */
	id: /*#__PURE__*/ v.string(),
	/** Repository DID */
	repo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	/**
	 * Repository DID that the commit was checked out from, if different from repo (e.g. a fork for a fork-based
	 * pull request)
	 */
	sourceRepo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	/** Trigger event metadata */
	get trigger() {
		return /*#__PURE__*/ v.variant([
			ShTangledCiTrigger.manualSchema,
			ShTangledCiTrigger.pullRequestSchema,
			ShTangledCiTrigger.pushSchema,
		]);
	},
	/**
	 * Triggered workflows
	 *
	 * @minLength 1
	 * @maxLength 50
	 */
	get workflows() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(workflowSchema), [
			/*#__PURE__*/ v.arrayLength(1, 50),
		]);
	},
});
const _workflowSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.ci.pipeline#workflow')),
	error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	finishedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Spindle-local workflow id. Unique per pipeline, usually same as name. */
	id: /*#__PURE__*/ v.string(),
	/**
	 * Name of the workflow
	 *
	 * @minGraphemes 1
	 * @maxGraphemes 40
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(1, 40)]),
	startedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Workflow status */
	status: /*#__PURE__*/ v.literalEnum(['cancelled', 'failed', 'pending', 'running', 'success', 'timeout']),
});

type main$schematype = typeof _mainSchema;
type workflow$schematype = typeof _workflowSchema;

export interface mainSchema extends main$schematype {}
export interface workflowSchema extends workflow$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const workflowSchema = _workflowSchema as workflowSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Workflow extends v.InferInput<typeof workflowSchema> {}
