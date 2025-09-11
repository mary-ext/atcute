import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.archive', {
	params: /*#__PURE__*/ v.object({
		format: /*#__PURE__*/ v.literalEnum(['tar', 'tar.bz2', 'tar.gz', 'tar.xz', 'zip']),
		prefix: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		ref: /*#__PURE__*/ v.string(),
		repo: /*#__PURE__*/ v.string(),
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
		'sh.tangled.repo.archive': mainSchema;
	}
}
