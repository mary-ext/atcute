import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitDefs from '../../git/defs.ts';

import * as OrgTangledTempGitListTags from './listTags.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.git.getRef', {
	params: /*#__PURE__*/ v.object({
		/** Reference name. Such as master, refs/heads/master, or v1.16.0-alpha. */
		ref: /*#__PURE__*/ v.string(),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Present only for annotated tags */
			get annotation() {
				return /*#__PURE__*/ v.optional(OrgTangledTempGitListTags.annotationSchema);
			},
			get author() {
				return OrgTangledGitDefs.signatureSchema;
			},
			/** Latest commit message */
			message: /*#__PURE__*/ v.string(),
			/** Full reference name. Example: refs/heads/master */
			name: /*#__PURE__*/ v.string(),
			/** Latest commit oid on this reference. */
			oid: /*#__PURE__*/ v.string(),
			/** Number of commits reachable from this tip */
			totalCommits: /*#__PURE__*/ v.integer(),
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
		'org.tangled.temp.git.getRef': mainSchema;
	}
}
