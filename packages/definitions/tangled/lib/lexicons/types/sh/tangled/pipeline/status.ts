import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.pipeline.status'),
		/**
		 * time of creation of this status update
		 */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * error message if failed
		 */
		error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * exit code if failed
		 */
		exitCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * ATURI of the pipeline
		 */
		pipeline: /*#__PURE__*/ v.resourceUriString(),
		/**
		 * status of the workflow
		 */
		status: /*#__PURE__*/ v.literalEnum(['cancelled', 'failed', 'pending', 'running', 'success', 'timeout']),
		/**
		 * name of the workflow within this pipeline
		 */
		workflow: /*#__PURE__*/ v.resourceUriString(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.pipeline.status': mainSchema;
	}
}
