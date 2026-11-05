import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitDefs from './defs.ts';

const _annotationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.listTags#annotation')),
	/** Tag message */
	message: /*#__PURE__*/ v.string(),
	get tagger() {
		return /*#__PURE__*/ v.optional(OrgTangledGitDefs.signatureSchema);
	},
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.git.listTags', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of tags to return
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get tags() {
				return /*#__PURE__*/ v.array(tagInfoSchema);
			},
			/** Total number of tags in the repository */
			total: /*#__PURE__*/ v.integer(),
		}),
	},
});
const _tagInfoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.git.listTags#tagInfo')),
	/** Present only for annotated tags */
	get annotation() {
		return /*#__PURE__*/ v.optional(annotationSchema);
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
});

type annotation$schematype = typeof _annotationSchema;
type main$schematype = typeof _mainSchema;
type tagInfo$schematype = typeof _tagInfoSchema;

export interface annotationSchema extends annotation$schematype {}
export interface mainSchema extends main$schematype {}
export interface tagInfoSchema extends tagInfo$schematype {}

export const annotationSchema = _annotationSchema as annotationSchema;
export const mainSchema = _mainSchema as mainSchema;
export const tagInfoSchema = _tagInfoSchema as tagInfoSchema;

export interface Annotation extends v.InferInput<typeof annotationSchema> {}
export interface TagInfo extends v.InferInput<typeof tagInfoSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.git.listTags': mainSchema;
	}
}
