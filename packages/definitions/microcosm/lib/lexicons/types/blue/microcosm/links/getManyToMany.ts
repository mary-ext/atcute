import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _itemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.microcosm.links.getManyToMany#item')),
	get linkRecord() {
		return linkRecordSchema;
	},
	/**
	 * the secondary subject from the link record
	 */
	otherSubject: /*#__PURE__*/ v.string(),
});
const _linkRecordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.microcosm.links.getManyToMany#linkRecord')),
	/**
	 * the collection of the linking record
	 */
	collection: /*#__PURE__*/ v.nsidString(),
	/**
	 * the DID of the linking record's repository
	 */
	did: /*#__PURE__*/ v.didString(),
	/**
	 * the record key of the linking record
	 */
	rkey: /*#__PURE__*/ v.recordKeyString(),
});
const _mainSchema = /*#__PURE__*/ v.query('blue.microcosm.links.getManyToMany', {
	params: /*#__PURE__*/ v.object({
		/**
		 * number of results to return
		 * @minimum 1
		 * @maximum 100
		 * @default 16
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			16,
		),
		/**
		 * filter linking records from specific users
		 */
		linkDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
		/**
		 * filter secondary links to specific subjects
		 */
		otherSubject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * path to the secondary link in the many-to-many record (e.g., 'otherThing.uri')
		 */
		pathToOther: /*#__PURE__*/ v.string(),
		/**
		 * collection and path specification for the primary link (e.g., 'app.bsky.feed.like:subject.uri')
		 */
		source: /*#__PURE__*/ v.string(),
		/**
		 * the primary target being linked to (at-uri, did, or uri)
		 */
		subject: /*#__PURE__*/ v.genericUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * pagination cursor
			 */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nullable(/*#__PURE__*/ v.string())),
			get items() {
				return /*#__PURE__*/ v.array(itemSchema);
			},
		}),
	},
});

type item$schematype = typeof _itemSchema;
type linkRecord$schematype = typeof _linkRecordSchema;
type main$schematype = typeof _mainSchema;

export interface itemSchema extends item$schematype {}
export interface linkRecordSchema extends linkRecord$schematype {}
export interface mainSchema extends main$schematype {}

export const itemSchema = _itemSchema as itemSchema;
export const linkRecordSchema = _linkRecordSchema as linkRecordSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Item extends v.InferInput<typeof itemSchema> {}
export interface LinkRecord extends v.InferInput<typeof linkRecordSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'blue.microcosm.links.getManyToMany': mainSchema;
	}
}
