import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _jobStatusSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.video.defs#jobStatus')),
	jobId: /*#__PURE__*/ v.string(),
	did: /*#__PURE__*/ v.didString(),
	state: /*#__PURE__*/ v.string<'JOB_STATE_COMPLETED' | 'JOB_STATE_FAILED' | (string & {})>(),
	progress: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
	),
	blob: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
	error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type jobStatus$schematype = typeof _jobStatusSchema;

export interface jobStatusSchema extends jobStatus$schematype {}

export const jobStatusSchema = _jobStatusSchema as jobStatusSchema;

export interface JobStatus extends v.InferInput<typeof jobStatusSchema> {}
