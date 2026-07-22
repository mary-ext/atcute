import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _hitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.search.query#hit')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	/** Collection of the matched record. */
	nsid: /*#__PURE__*/ v.nsidString(),
	/** Relevance score of the hit, a floating-point number where higher ranks first. */
	score: /*#__PURE__*/ v.unknown(),
	uri: /*#__PURE__*/ v.resourceUriString(),
	/** Embedded matched record. */
	value: /*#__PURE__*/ v.unknown(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.search.query', {
	params: /*#__PURE__*/ v.object({
		/** Restrict to records authored by this DID. */
		author: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
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
		/** Restrict to records of this collection. */
		nsid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nsidString()),
		/**
		 * Full-text search query.
		 *
		 * @minLength 1
		 */
		q: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1)]),
		/** Restrict to records under this repo DID. */
		repo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/** Restrict to records created at or after this time. */
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/** Restrict to records created at or before this time. */
		until: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get hits() {
				return /*#__PURE__*/ v.array(hitSchema);
			},
		}),
	},
});

type hit$schematype = typeof _hitSchema;
type main$schematype = typeof _mainSchema;

export interface hitSchema extends hit$schematype {}
export interface mainSchema extends main$schematype {}

export const hitSchema = _hitSchema as hitSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Hit extends v.InferInput<typeof hitSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.search.query': mainSchema;
	}
}
