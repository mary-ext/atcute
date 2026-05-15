import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledGitTempDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp.getEntity', {
	params: /*#__PURE__*/ v.object({
		/** path of the entity */
		path: /*#__PURE__*/ v.string(),
		/**
		 * Git reference (branch, tag, or commit SHA)
		 *
		 * @default 'HEAD'
		 */
		ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'HEAD'),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return ShTangledGitTempDefs.blobSchema;
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
		'sh.tangled.git.temp.getEntity': mainSchema;
	}
}
