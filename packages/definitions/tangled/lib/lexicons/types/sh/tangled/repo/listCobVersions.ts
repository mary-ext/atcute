import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.listCobVersions', {
	params: /*#__PURE__*/ v.object({
		/** Pass the cursor from one page into the next query to keep walking versions. */
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
		 * Which end the walk starts from. `desc` puts the newest version first, which is where the version you
		 * just wrote is.
		 *
		 * @default 'asc'
		 */
		order: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'asc' | 'desc' | (string & {})>(), 'asc'),
		/** AT-URI of a record in a repository this knot hosts, its repository authority a DID. */
		uri: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Left out when the page already reaches the last version in the requested order. */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** How many versions the record has, whatever the page. */
			total: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			uri: /*#__PURE__*/ v.resourceUriString(),
			get versions() {
				return /*#__PURE__*/ v.array(versionSchema);
			},
		}),
	},
});
const _versionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.listCobVersions#version')),
	/** Git Object ID of the change associated with this version. */
	changeId: /*#__PURE__*/ v.string(),
	/** Missing once the version is removed, or when the change is a deletion. */
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	/** When this knot wrote the commit this version rides in. Not the record's own `createdAt`. */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** The DID of the account that made this version. */
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
		'sh.tangled.repo.listCobVersions': mainSchema;
	}
}
