import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('network.bsky.jetstream.getImportStatus', {
	params: /*#__PURE__*/ v.object({
		/** Job id returned by importTimestamps. When omitted, the current or most recent job is reported. */
		job: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Whether Phase A+B completed (the offset files are durable). */
			bucketed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/** Failure detail; present only when state is failed. */
			error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Present only for a terminal job. */
			finishedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			/** Job id. */
			job: /*#__PURE__*/ v.string(),
			/** Current phase: parse_bucket (Phase A+B) or apply (Phase C). */
			phase: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'apply' | 'parse_bucket' | (string & {})>()),
			/** @minimum 0 */
			rowsCorruptOffset: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** @minimum 0 */
			rowsMatchedAllVersions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** @minimum 0 */
			rowsMatchedSpecific: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** @minimum 0 */
			rowsMutated: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** @minimum 0 */
			rowsRejected: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** @minimum 0 */
			rowsTotal: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** @minimum 0 */
			rowsValid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Segments processed so far in Phase C.
			 *
			 * @minimum 0
			 */
			segmentsApplied: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** @minimum 0 */
			segmentsExamined: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** @minimum 0 */
			segmentsPatched: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * Segments Phase C will process (after resume-skips).
			 *
			 * @minimum 0
			 */
			segmentsToApply: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** @minimum 0 */
			specificCidsUnmatched: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** Lifecycle state. */
			state: /*#__PURE__*/ v.string<'complete' | 'failed' | 'running' | (string & {})>(),
			submittedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'network.bsky.jetstream.getImportStatus': mainSchema;
	}
}
