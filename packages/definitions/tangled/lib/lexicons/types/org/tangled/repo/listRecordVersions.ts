import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.repo.listRecordVersions', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @default 100
		 * @minimum 1
		 * @maximum 500
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 500)]),
			100,
		),
		/**
		 * asc lists the oldest version first, desc the newest.
		 *
		 * @default 'asc'
		 */
		order: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'asc' | 'desc' | (string & {})>(), 'asc'),
		/** Record in a repo this knot hosts */
		uri: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Cursor for the next page, left out when the page already reaches the newest version */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			uri: /*#__PURE__*/ v.resourceUriString(),
			get versions() {
				return /*#__PURE__*/ v.array(versionSchema);
			},
		}),
	},
});
const _versionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.repo.listRecordVersions#version')),
	/** Object ID of the git change that produced this version */
	changeId: /*#__PURE__*/ v.string(),
	/** Content id of this version. Missing when the version was removed or the change is a deletion. */
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	/** When this knot wrote the commit this version rides in. Not the record's own `createdAt`. */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** The account that authored the change */
	editor: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;
type version$schematype = typeof _versionSchema;

export interface mainSchema extends main$schematype {}
export interface versionSchema extends version$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const versionSchema = _versionSchema as versionSchema;

export interface Version extends v.InferInput<typeof versionSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.repo.listRecordVersions': mainSchema;
	}
}
