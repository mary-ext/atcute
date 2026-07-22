import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.issue.countStates', {
	params: /*#__PURE__*/ v.object({
		/** Issue AT-URI whose state records to list. */
		subject: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Total number of matching records.
			 *
			 * @minimum 0
			 */
			count: /*#__PURE__*/ v.integer(),
			/**
			 * Number of distinct authors among the matching records.
			 *
			 * @minimum 0
			 */
			distinctAuthors: /*#__PURE__*/ v.integer(),
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
		'sh.tangled.repo.issue.countStates': mainSchema;
	}
}
