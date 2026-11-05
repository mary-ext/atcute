import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledGitDefs from '../defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp2.getDiff', {
	params: /*#__PURE__*/ v.object({
		baseCommit: /*#__PURE__*/ v.string(),
		baseRepo: /*#__PURE__*/ v.didString(),
		headCommit: /*#__PURE__*/ v.string(),
		headRepo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get diffs() {
				return /*#__PURE__*/ v.array(ShTangledGitDefs.fileDiffSchema);
			},
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
		'sh.tangled.git.temp2.getDiff': mainSchema;
	}
}
