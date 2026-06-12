import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledGitTempDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp.getEntry', {
	params: /*#__PURE__*/ v.object({
		/** path of the entity */
		path: /*#__PURE__*/ v.string(),
		/**
		 * Git revision (branch, tag, or commit id)
		 *
		 * @default 'HEAD'
		 */
		ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'HEAD'),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get lastCommit() {
				return /*#__PURE__*/ v.optional(ShTangledGitTempDefs.commitSchema);
			},
			mode: /*#__PURE__*/ v.literalEnum(['0040000', '0100644', '0100664', '0100755', '0120000', '0160000']),
			/** The file name */
			name: /*#__PURE__*/ v.string(),
			oid: /*#__PURE__*/ v.string(),
			/** Submodule information if path is a submodule */
			get submodule() {
				return /*#__PURE__*/ v.optional(ShTangledGitTempDefs.submoduleSchema);
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
		'sh.tangled.git.temp.getEntry': mainSchema;
	}
}
