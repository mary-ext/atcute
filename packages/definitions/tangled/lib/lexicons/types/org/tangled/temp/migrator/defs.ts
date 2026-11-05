import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _jobSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.migrator.defs#job')),
	/**
	 * Number of migration attempts.
	 *
	 * @minimum 0
	 */
	attempts: /*#__PURE__*/ v.integer(),
	/** Error message from the last failed attempt. */
	error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Unique job ID. */
	id: /*#__PURE__*/ v.string(),
	knotDid: /*#__PURE__*/ v.didString(),
	/** @maxLength 100 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	private: /*#__PURE__*/ v.boolean(),
	/** DID of the created repository, once created on the knot. */
	repoDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	sourceUrl: /*#__PURE__*/ v.genericUriString(),
	/** Current status of the migration job. */
	status: /*#__PURE__*/ v.string<
		'authorization_required' | 'cloning' | 'completed' | 'failed' | 'importing' | 'queued' | (string & {})
	>(),
});
const _newJobSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.migrator.defs#newJob')),
	/**
	 * Repository description.
	 *
	 * @maxGraphemes 140
	 */
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(0, 140)]),
	),
	/** DID of the destination knot. */
	knotDid: /*#__PURE__*/ v.didString(),
	/**
	 * Repository name reserved on the destination knot.
	 *
	 * @maxLength 100
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	/**
	 * Whether the source repository is private.
	 *
	 * @default false
	 */
	private: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	/** HTTPS URL of the source repository. */
	sourceUrl: /*#__PURE__*/ v.genericUriString(),
});
const _taskSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.migrator.defs#task')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	id: /*#__PURE__*/ v.string(),
	get jobs() {
		return /*#__PURE__*/ v.array(jobSchema);
	},
	/** DID of the user who created the task. */
	ownerDid: /*#__PURE__*/ v.didString(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});

type job$schematype = typeof _jobSchema;
type newJob$schematype = typeof _newJobSchema;
type task$schematype = typeof _taskSchema;

export interface jobSchema extends job$schematype {}
export interface newJobSchema extends newJob$schematype {}
export interface taskSchema extends task$schematype {}

export const jobSchema = _jobSchema as jobSchema;
export const newJobSchema = _newJobSchema as newJobSchema;
export const taskSchema = _taskSchema as taskSchema;

export interface Job extends v.InferInput<typeof jobSchema> {}
export interface NewJob extends v.InferInput<typeof newJobSchema> {}
export interface Task extends v.InferInput<typeof taskSchema> {}
