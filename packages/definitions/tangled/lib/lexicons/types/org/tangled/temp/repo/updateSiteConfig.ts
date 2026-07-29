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
			/** DID of the repository as minted by the knot. */
			repoDid: /*#__PURE__*/ v.didString(),
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
