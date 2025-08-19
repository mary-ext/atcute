import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.pipeline.status'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		exitCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		pipeline: /*#__PURE__*/ v.resourceUriString(),
		status: /*#__PURE__*/ v.literalEnum(['cancelled', 'failed', 'pending', 'running', 'success', 'timeout']),
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
