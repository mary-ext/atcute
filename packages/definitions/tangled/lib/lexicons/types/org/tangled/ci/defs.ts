import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledEventPullRequest from '../event/pullRequest.ts';
import * as OrgTangledEventPush from '../event/push.ts';

import * as OrgTangledCiTriggerManual from './trigger/manual.ts';
import * as OrgTangledCiTriggerSchedule from './trigger/schedule.ts';

const _externalSourceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.ci.defs#externalSource')),
	link: /*#__PURE__*/ v.genericUriString(),
	/** human-readable name of external source */
	name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _fileSourceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.ci.defs#fileSource')),
	/**
	 * @minLength 40
	 * @maxLength 128
	 */
	commit: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 128)]),
	get lines() {
		return /*#__PURE__*/ v.optional(lineRangeSchema);
	},
	/** @minLength 1 */
	path: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1)]),
	repo: /*#__PURE__*/ v.didString(),
});
const _lineRangeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.ci.defs#lineRange')),
	/** @minimum 1 */
	end: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/** @minimum 1 */
	start: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});
const _pipelineSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.ci.defs#pipeline')),
	/** Commit Id this pipeline is running on */
	commit: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Spindle-local pipeline id */
	id: /*#__PURE__*/ v.recordKeyString(),
	/** Repository DID */
	repo: /*#__PURE__*/ v.didString(),
	/**
	 * Repository DID that the commit was checked out from, if different from repo (e.g. a fork for a fork-based
	 * pull request)
	 */
	sourceRepo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	/** Trigger event that triggered this pipeline. */
	get trigger() {
		return /*#__PURE__*/ v.variant([
			OrgTangledCiTriggerManual.mainSchema,
			OrgTangledCiTriggerSchedule.mainSchema,
			OrgTangledEventPullRequest.mainSchema,
			OrgTangledEventPush.mainSchema,
		]);
	},
	/**
	 * Triggered workflows
	 *
	 * @minLength 1
	 * @maxLength 50
	 */
	get workflows() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(workflowRunSchema), [
			/*#__PURE__*/ v.arrayLength(1, 50),
		]);
	},
});
const _workflowSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.ci.defs#workflow')),
	/** Fingerprint of the workflow definition as resolved by the spindle. */
	hash: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * @minLength 1
	 * @maxLength 128
	 */
	id: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 128)]),
	/**
	 * Human-readable name of the workflow
	 *
	 * @minLength 1
	 * @maxLength 128
	 */
	name: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 128)]),
	),
	get source() {
		return /*#__PURE__*/ v.variant([externalSourceSchema, fileSourceSchema]);
	},
	/** Event types that triggers this workflow. */
	triggers: /*#__PURE__*/ v.array(
		/*#__PURE__*/ v.string<
			| 'org.tangled.ci.trigger.manual'
			| 'org.tangled.ci.trigger.schedule'
			| 'org.tangled.event.pullRequest'
			| 'org.tangled.event.push'
			| (string & {})
		>(),
	),
});
const _workflowRunSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.ci.defs#workflowRun')),
	/** Workflow definition where this workflow run is originated from. */
	get definition() {
		return workflowSchema;
	},
	error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	finishedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * Pipeline-local workflow id, usually same as name.
	 *
	 * @minLength 1
	 * @maxLength 128
	 */
	id: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 128)]),
	/**
	 * Human-readable name of the workflow
	 *
	 * @maxLength 128
	 */
	name: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 128)]),
	),
	startedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Workflow status */
	status: /*#__PURE__*/ v.literalEnum([
		'blocked',
		'cancelled',
		'failed',
		'pending',
		'running',
		'success',
		'timeout',
	]),
});

type externalSource$schematype = typeof _externalSourceSchema;
type fileSource$schematype = typeof _fileSourceSchema;
type lineRange$schematype = typeof _lineRangeSchema;
type pipeline$schematype = typeof _pipelineSchema;
type workflow$schematype = typeof _workflowSchema;
type workflowRun$schematype = typeof _workflowRunSchema;

export interface externalSourceSchema extends externalSource$schematype {}
export interface fileSourceSchema extends fileSource$schematype {}
export interface lineRangeSchema extends lineRange$schematype {}
export interface pipelineSchema extends pipeline$schematype {}
export interface workflowSchema extends workflow$schematype {}
export interface workflowRunSchema extends workflowRun$schematype {}

export const externalSourceSchema = _externalSourceSchema as externalSourceSchema;
export const fileSourceSchema = _fileSourceSchema as fileSourceSchema;
export const lineRangeSchema = _lineRangeSchema as lineRangeSchema;
export const pipelineSchema = _pipelineSchema as pipelineSchema;
export const workflowSchema = _workflowSchema as workflowSchema;
export const workflowRunSchema = _workflowRunSchema as workflowRunSchema;

export interface ExternalSource extends v.InferInput<typeof externalSourceSchema> {}
export interface FileSource extends v.InferInput<typeof fileSourceSchema> {}
export interface LineRange extends v.InferInput<typeof lineRangeSchema> {}
export interface Pipeline extends v.InferInput<typeof pipelineSchema> {}
export interface Workflow extends v.InferInput<typeof workflowSchema> {}
export interface WorkflowRun extends v.InferInput<typeof workflowRunSchema> {}
