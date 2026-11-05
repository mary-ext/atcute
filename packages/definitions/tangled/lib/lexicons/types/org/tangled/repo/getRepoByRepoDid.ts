import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.repo.getRepoByRepoDid', {
	params: /*#__PURE__*/ v.object({
		/** Repo DID whose sh.tangled.repo record to fetch. */
		repoDid: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			/**
			 * Host of the knot named by the #tangled_knot service in the repo's DID document. Absent when it names
			 * none.
			 */
			knot: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			uri: /*#__PURE__*/ v.resourceUriString(),
			/** Embedded sh.tangled.repo record. */
			value: /*#__PURE__*/ v.unknown(),
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
		'org.tangled.repo.getRepoByRepoDid': mainSchema;
	}
}
