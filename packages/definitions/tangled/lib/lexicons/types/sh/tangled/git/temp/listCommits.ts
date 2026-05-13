import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp.listCommits', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor (commit SHA) */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of commits to return
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** Git reference (branch, tag, or commit SHA) */
		ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** AT-URI of the repository */
		repo: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'blob',
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.git.temp.listCommits': mainSchema;
	}
}
