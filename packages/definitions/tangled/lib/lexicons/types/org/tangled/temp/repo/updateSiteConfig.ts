import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.repo.updateSiteConfig', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Branch to deploy from. */
			branch: /*#__PURE__*/ v.string(),
			/** Directory within the repository to deploy (e.g. '/' or '/docs'). */
			dir: /*#__PURE__*/ v.string(),
			/** Whether this repo should serve as the index (root) for the claimed domain. */
			isIndex: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/** Knot host that hosts the repository. */
			knot: /*#__PURE__*/ v.string(),
			/** Repository name as its knot reports it (the first path segment its sub-path site is served under). */
			name: /*#__PURE__*/ v.string(),
			/** DID of the repository as minted by the knot. */
			repoDid: /*#__PURE__*/ v.didString(),
			/** Atproto record key of the repository; identifies the {did}/{rkey}/ prefix in R2. */
			rkey: /*#__PURE__*/ v.string(),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.repo.updateSiteConfig': mainSchema;
	}
}
