import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledCiPipeline from './pipeline.ts';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.ci.queryPipelines', {
	params: /*#__PURE__*/ v.object({
		/** Filter pipelines by commits. When provided, maximum one pipeline per commit id will be returned. */
		commits: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of pipelines to return
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 250
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 250)]),
			50,
		),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get pipelines() {
				return /*#__PURE__*/ v.array(ShTangledCiPipeline.mainSchema);
			},
			/** Maximum number of pipelines */
			total: /*#__PURE__*/ v.integer(),
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
		'sh.tangled.ci.queryPipelines': mainSchema;
	}
}
