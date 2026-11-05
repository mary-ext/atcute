import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitOid from '../git/oid.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.review.patch'),
		get base() {
			return OrgTangledGitOid.mainSchema;
		},
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get head() {
			return OrgTangledGitOid.mainSchema;
		},
		get source() {
			return /*#__PURE__*/ v.optional(sourceSchema);
		},
		/** ticket-id */
		ticket: /*#__PURE__*/ v.recordKeyString(),
	}),
);
const _sourceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.review.patch#source')),
	/** @maxLength 244 */
	branch: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 244)]),
	repo: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;
type source$schematype = typeof _sourceSchema;

export interface mainSchema extends main$schematype {}
export interface sourceSchema extends source$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const sourceSchema = _sourceSchema as sourceSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Source extends v.InferInput<typeof sourceSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.review.patch': mainSchema;
	}
}
