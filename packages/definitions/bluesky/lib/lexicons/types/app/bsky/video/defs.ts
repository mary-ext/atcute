import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _jobStatusSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.video.defs#jobStatus')),
	blob: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
	did: /*#__PURE__*/ v.didString(),
	error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	jobId: /*#__PURE__*/ v.string(),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Progress within the current processing state.
	 * @minimum 0
	 * @maximum 100
	 */
	progress: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
	),
	/**
	 * The state of the video processing job. All values not listed as a known value indicate that the job is in process.
	 */
	state: /*#__PURE__*/ v.string<'JOB_STATE_COMPLETED' | 'JOB_STATE_FAILED' | (string & {})>(),
});

type jobStatus$schematype = typeof _jobStatusSchema;

export interface jobStatusSchema extends jobStatus$schematype {}

export const jobStatusSchema = _jobStatusSchema as jobStatusSchema;

export interface JobStatus extends v.InferInput<typeof jobStatusSchema> {}
