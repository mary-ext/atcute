import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.searchPosts', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Filter to posts by the given account. Handles are resolved to DID before query-time.
		 */
		author: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.actorIdentifierString()),
		/**
		 * Optional pagination mechanism; may not necessarily allow scrolling through entire result set.
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Filter to posts with URLs (facet links or embeds) linking to the given domain (hostname). Server may apply hostname normalization.
		 */
		domain: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Filter to posts in the given language. Expected to be based on post language field, though server may override language detection.
		 */
		lang: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.languageCodeString()),
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
		 * Filter to posts which mention the given account. Handles are resolved to DID before query-time. Only matches rich-text facet mentions.
		 */
		mentions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.actorIdentifierString()),
		/**
		 * Search query string; syntax, phrase, boolean, and faceting is unspecified, but Lucene query syntax is recommended.
		 */
		q: /*#__PURE__*/ v.string(),
		/**
		 * Filter results for posts after the indicated datetime (inclusive). Expected to use 'sortAt' timestamp, which may not match 'createdAt'. Can be a datetime, or just an ISO date (YYYY-MM-DD).
		 */
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Specifies the ranking order of results.
		 * @default "latest"
		 */
		sort: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'latest' | 'top' | (string & {})>(), 'latest'),
		/**
		 * Filter to posts with the given tag (hashtag), based on rich-text facet or tag field. Do not include the hash (#) prefix. Multiple tags can be specified, with 'AND' matching.
		 */
		tag: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64),
				]),
			),
		),
		/**
		 * Filter results for posts before the indicated datetime (not inclusive). Expected to use 'sortAt' timestamp, which may not match 'createdAt'. Can be a datetime, or just an ISO date (YYY-MM-DD).
		 */
		until: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Filter to posts with links (facet links or embeds) pointing to this URL. Server may apply URL normalization or fuzzy matching.
		 */
		url: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Count of search hits. Optional, may be rounded/truncated, and may not be possible to paginate through all hits.
			 */
			hitsTotal: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			get posts() {
				return /*#__PURE__*/ v.array(AppBskyFeedDefs.postViewSchema);
			},
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
		'app.bsky.feed.searchPosts': mainSchema;
	}
}
