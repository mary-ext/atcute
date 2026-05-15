import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp.getDiff', {
	params: /*#__PURE__*/ v.object({
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
		/** First revision (commit, branch, or tag) */
		rev1: /*#__PURE__*/ v.string(),
		/** Second revision (commit, branch, or tag) */
		rev2: /*#__PURE__*/ v.string(),
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
		'sh.tangled.git.temp.getDiff': mainSchema;
	}
}
