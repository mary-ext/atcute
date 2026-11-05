import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.repo.countPulls', {
	params: /*#__PURE__*/ v.object({
		/** Restrict to pulls authored by this user DID. */
		author: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/** Restrict to pulls whose latest derived status matches. */
		status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'closed' | 'merged' | 'open' | (string & {})>()),
		/** Repo DID to list pulls for */
		subject: /*#__PURE__*/ v.didString(),
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
		'org.tangled.repo.countPulls': mainSchema;
	}
}
