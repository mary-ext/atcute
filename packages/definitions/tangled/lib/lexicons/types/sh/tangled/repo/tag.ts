import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.tag', {
	params: /*#__PURE__*/ v.object({
		/** Repository identifier in format 'did:plc:.../repoName' */
		repo: /*#__PURE__*/ v.string(),
		/** Name of tag, such as v1.3.0 */
		tag: /*#__PURE__*/ v.string(),
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
		'sh.tangled.repo.tag': mainSchema;
	}
}
