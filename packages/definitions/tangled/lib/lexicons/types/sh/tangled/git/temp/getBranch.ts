import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledGitTempDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp.getBranch', {
	params: /*#__PURE__*/ v.object({
		/** Branch name to get information for */
		name: /*#__PURE__*/ v.string(),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get author() {
				return /*#__PURE__*/ v.optional(ShTangledGitTempDefs.signatureSchema);
			},
			/** Latest commit hash on this branch */
			hash: /*#__PURE__*/ v.string(),
			/** Latest commit message */
			message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Branch name */
			name: /*#__PURE__*/ v.string(),
			/** Timestamp of latest commit */
			when: /*#__PURE__*/ v.datetimeString(),
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
		'sh.tangled.git.temp.getBranch': mainSchema;
	}
}
