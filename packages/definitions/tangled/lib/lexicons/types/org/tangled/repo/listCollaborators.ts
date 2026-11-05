import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _listItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.repo.listCollaborators#listItem')),
	/** DID that added this collaborator */
	addedBy: /*#__PURE__*/ v.didString(),
	/** Optional record CID for record-backed indexers */
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	/** When the repository offered collaboration */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** When the collaboration took effect. This listing sorts and pages on it. */
	effectiveSince: /*#__PURE__*/ v.datetimeString(),
	/** DID of the collaborator */
	subject: /*#__PURE__*/ v.didString(),
	/** Optional record AT-URI for record-backed indexers */
	uri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	/**
	 * When the knot resolved the collaborator's own acceptance record. Absent on a grant that predates the
	 * consent model.
	 */
	verifiedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.repo.listCollaborators', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 1000
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			50,
		),
		/**
		 * Absolute offset for random-access pagination. Mutually exclusive with cursor; offsets drift under
		 * concurrent writes, so follow up with the returned cursor.
		 *
		 * @minimum 0
		 */
		offset: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Sort direction by effectiveSince.
		 *
		 * @default 'desc'
		 */
		order: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'asc' | 'desc' | (string & {})>(), 'desc'),
		/** Repo DID whose collaborator records to list. */
		subject: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get items() {
				return /*#__PURE__*/ v.array(listItemSchema);
			},
			/** Total items in the full list; omitted for filtered or merged views */
			total: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		}),
	},
});

type listItem$schematype = typeof _listItemSchema;
type main$schematype = typeof _mainSchema;

export interface listItemSchema extends listItem$schematype {}
export interface mainSchema extends main$schematype {}

export const listItemSchema = _listItemSchema as listItemSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface ListItem extends v.InferInput<typeof listItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.repo.listCollaborators': mainSchema;
	}
}
