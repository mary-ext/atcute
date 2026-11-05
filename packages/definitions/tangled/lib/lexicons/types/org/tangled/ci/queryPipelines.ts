import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledCiDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.ci.queryPipelines', {
	params: /*#__PURE__*/ v.object({
		/** Filter pipelines by commit ids. */
		commits: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 64)]),
			),
		),
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
		/**
		 * Filter pipelines by trigger kind. When provided, pipelines matching any listed kind are returned; when
		 * omitted, every kind is returned.
		 */
		triggers: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.string<
					| 'org.tangled.ci.trigger.manual'
					| 'org.tangled.ci.trigger.schedule'
					| 'org.tangled.event.pullRequest'
					| 'org.tangled.event.push'
					| (string & {})
				>(),
			),
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get pipelines() {
				return /*#__PURE__*/ v.array(OrgTangledCiDefs.pipelineSchema);
			},
			/** Number of matching pipelines */
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
		'org.tangled.ci.queryPipelines': mainSchema;
	}
}
