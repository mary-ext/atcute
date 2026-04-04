import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledGitTempDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp.getHead', {
	params: /*#__PURE__*/ v.object({
		/**
		 * AT-URI of the repository
		 */
		repo: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return ShTangledGitTempDefs.branchSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.git.temp.getHead': mainSchema;
	}
}
