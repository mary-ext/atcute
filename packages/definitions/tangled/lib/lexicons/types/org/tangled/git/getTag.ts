import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitDefs from './defs.ts';
import * as OrgTangledGitListTags from './listTags.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.git.getTag', {
	params: /*#__PURE__*/ v.object({
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
		/** Name of tag, such as v1.3.0 */
		tag: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Present only for annotated tags */
			get annotation() {
				return /*#__PURE__*/ v.optional(OrgTangledGitListTags.annotationSchema);
			},
			get author() {
				return OrgTangledGitDefs.signatureSchema;
			},
			/** Latest commit message */
			message: /*#__PURE__*/ v.string(),
			/** Tag name */
			name: /*#__PURE__*/ v.string(),
			/** Latest commit oid on this tag */
			oid: /*#__PURE__*/ v.string(),
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
		'org.tangled.git.getTag': mainSchema;
	}
}
