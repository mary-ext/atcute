import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _linkRecordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.microcosm.links.getBacklinks#linkRecord')),
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
const _mainSchema = /*#__PURE__*/ v.query('blue.microcosm.links.getBacklinks', {
	params: /*#__PURE__*/ v.object({
		/**
		 * filter links to those from specific users
		 */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
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
		 * collection and path specification (e.g., 'app.bsky.feed.like:subject.uri')
		 */
		source: /*#__PURE__*/ v.string(),
		/**
		 * the target being linked to (at-uri, did, or uri)
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
			get records() {
				return /*#__PURE__*/ v.array(linkRecordSchema);
			},
			/**
			 * total number of matching links
			 */
			total: /*#__PURE__*/ v.integer(),
		}),
	},
});

type linkRecord$schematype = typeof _linkRecordSchema;
type main$schematype = typeof _mainSchema;

export interface linkRecordSchema extends linkRecord$schematype {}
export interface mainSchema extends main$schematype {}

export const linkRecordSchema = _linkRecordSchema as linkRecordSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface LinkRecord extends v.InferInput<typeof linkRecordSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'blue.microcosm.links.getBacklinks': mainSchema;
	}
}
