import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyUnspeccedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.searchActorsSkeleton', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Optional pagination mechanism; may not necessarily allow scrolling through entire result set.
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 25
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			25,
		),
		/**
		 * Search query string; syntax, phrase, boolean, and faceting is unspecified, but Lucene query syntax is recommended. For typeahead search, only simple term match is supported, not full syntax.
		 */
		q: /*#__PURE__*/ v.string(),
		/**
		 * If true, acts as fast/simple 'typeahead' query.
		 */
		typeahead: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * DID of the account making the request (not included for public/unauthenticated queries). Used to boost followed accounts in ranking.
		 */
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get actors() {
				return /*#__PURE__*/ v.array(AppBskyUnspeccedDefs.skeletonSearchActorSchema);
			},
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Count of search hits. Optional, may be rounded/truncated, and may not be possible to paginate through all hits.
			 */
			hitsTotal: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
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
		'app.bsky.unspecced.searchActorsSkeleton': mainSchema;
	}
}
