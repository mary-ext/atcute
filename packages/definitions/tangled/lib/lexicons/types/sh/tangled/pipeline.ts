import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _cloneOptsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.pipeline#cloneOpts')),
	depth: /*#__PURE__*/ v.integer(),
	skip: /*#__PURE__*/ v.boolean(),
	submodules: /*#__PURE__*/ v.boolean(),
	tags: /*#__PURE__*/ v.boolean(),
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.pipeline'),
		get triggerMetadata() {
			return triggerMetadataSchema;
		},
		get workflows() {
			return /*#__PURE__*/ v.array(workflowSchema);
		},
	}),
);
const _manualTriggerDataSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.pipeline#manualTriggerData')),
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
});
const _pairSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.pipeline#pair')),
	key: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});
const _pullRequestTriggerDataSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.pipeline#pullRequestTriggerData')),
	/** the pull request lifecycle action that produced this trigger */
	action: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literalEnum(['closed', 'merged', 'opened', 'reopened', 'synchronize']),
	),
	/** AT-URI of the sh.tangled.repo.pull record this run belongs to */
	pull: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	sourceBranch: /*#__PURE__*/ v.string(),
	/**
	 * @minLength 40
	 * @maxLength 40
	 */
	sourceSha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 40)]),
	targetBranch: /*#__PURE__*/ v.string(),
});
const _pushTriggerDataSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.pipeline#pushTriggerData')),
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
const _triggerMetadataSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.pipeline#triggerMetadata')),
	kind: /*#__PURE__*/ v.literalEnum(['manual', 'pull_request', 'push']),
	get manual() {
		return /*#__PURE__*/ v.optional(manualTriggerDataSchema);
	},
	get pullRequest() {
		return /*#__PURE__*/ v.optional(pullRequestTriggerDataSchema);
	},
	get push() {
		return /*#__PURE__*/ v.optional(pushTriggerDataSchema);
	},
	get repo() {
		return triggerRepoSchema;
	},
	/**
	 * Repository DID that code and workflow definitions are checked out from, when different from repo (e.g. a
	 * fork's commit for a fork-based manual trigger). If absent, source uses repo itself.
	 */
	sourceRepo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
});
const _triggerRepoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.pipeline#triggerRepo')),
	defaultBranch: /*#__PURE__*/ v.string(),
	did: /*#__PURE__*/ v.didString(),
	knot: /*#__PURE__*/ v.string(),
	repo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** DID of the repo itself */
	repoDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
});
const _workflowSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.pipeline#workflow')),
	get clone() {
		return cloneOptsSchema;
	},
	engine: /*#__PURE__*/ v.string(),
	name: /*#__PURE__*/ v.string(),
	raw: /*#__PURE__*/ v.string(),
	runsOn: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
});

type cloneOpts$schematype = typeof _cloneOptsSchema;
type main$schematype = typeof _mainSchema;
type manualTriggerData$schematype = typeof _manualTriggerDataSchema;
type pair$schematype = typeof _pairSchema;
type pullRequestTriggerData$schematype = typeof _pullRequestTriggerDataSchema;
type pushTriggerData$schematype = typeof _pushTriggerDataSchema;
type triggerMetadata$schematype = typeof _triggerMetadataSchema;
type triggerRepo$schematype = typeof _triggerRepoSchema;
type workflow$schematype = typeof _workflowSchema;

export interface cloneOptsSchema extends cloneOpts$schematype {}
export interface mainSchema extends main$schematype {}
export interface manualTriggerDataSchema extends manualTriggerData$schematype {}
export interface pairSchema extends pair$schematype {}
export interface pullRequestTriggerDataSchema extends pullRequestTriggerData$schematype {}
export interface pushTriggerDataSchema extends pushTriggerData$schematype {}
export interface triggerMetadataSchema extends triggerMetadata$schematype {}
export interface triggerRepoSchema extends triggerRepo$schematype {}
export interface workflowSchema extends workflow$schematype {}

export const cloneOptsSchema = _cloneOptsSchema as cloneOptsSchema;
export const mainSchema = _mainSchema as mainSchema;
export const manualTriggerDataSchema = _manualTriggerDataSchema as manualTriggerDataSchema;
export const pairSchema = _pairSchema as pairSchema;
export const pullRequestTriggerDataSchema = _pullRequestTriggerDataSchema as pullRequestTriggerDataSchema;
export const pushTriggerDataSchema = _pushTriggerDataSchema as pushTriggerDataSchema;
export const triggerMetadataSchema = _triggerMetadataSchema as triggerMetadataSchema;
export const triggerRepoSchema = _triggerRepoSchema as triggerRepoSchema;
export const workflowSchema = _workflowSchema as workflowSchema;

export interface CloneOpts extends v.InferInput<typeof cloneOptsSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface ManualTriggerData extends v.InferInput<typeof manualTriggerDataSchema> {}
export interface Pair extends v.InferInput<typeof pairSchema> {}
export interface PullRequestTriggerData extends v.InferInput<typeof pullRequestTriggerDataSchema> {}
export interface PushTriggerData extends v.InferInput<typeof pushTriggerDataSchema> {}
export interface TriggerMetadata extends v.InferInput<typeof triggerMetadataSchema> {}
export interface TriggerRepo extends v.InferInput<typeof triggerRepoSchema> {}
export interface Workflow extends v.InferInput<typeof workflowSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.pipeline': mainSchema;
	}
}
