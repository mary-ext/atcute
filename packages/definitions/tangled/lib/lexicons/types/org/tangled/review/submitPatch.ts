import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitOid from '../git/oid.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.review.submitPatch', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get patch() {
				return patchSchema;
			},
			/** DID of the repository */
			repo: /*#__PURE__*/ v.didString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** CID of created org.tangled.review.patch record. */
			cid: /*#__PURE__*/ v.cidString(),
			/** AT-URI of created org.tangled.review.patch record. */
			uri: /*#__PURE__*/ v.resourceUriString(),
		}),
	},
});
const _patchSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.review.submitPatch#patch')),
	get base() {
		return OrgTangledGitOid.mainSchema;
	},
	get head() {
		return OrgTangledGitOid.mainSchema;
	},
	/** @maxLength 244 */
	sourceBranch: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 244)]),
	),
	/** DID of the repository to fetch `head` from. */
	sourceRepo: /*#__PURE__*/ v.didString(),
	/** ticket-id */
	ticket: /*#__PURE__*/ v.recordKeyString(),
});

type main$schematype = typeof _mainSchema;
type patch$schematype = typeof _patchSchema;

export interface mainSchema extends main$schematype {}
export interface patchSchema extends patch$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const patchSchema = _patchSchema as patchSchema;

export interface Patch extends v.InferInput<typeof patchSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.review.submitPatch': mainSchema;
	}
}
