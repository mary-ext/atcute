import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyFeedDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.searchPostsV2', {
	params: /*#__PURE__*/ v.object({
		/** Search the full index instead of the recent-post window. */
		allTime: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/** Include posts by any of these authors. Handles are resolved to DIDs before searching. */
		authors: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.actorIdentifierString())),
		/** Optional pagination cursor. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Include posts that link to any of these domains. */
		domains: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** Include posts that embed any of these AT URIs. */
		embeddedAtUris: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString())),
		/** Exclude posts by any of these authors. Handles are resolved to DIDs before searching. */
		excludeAuthors: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.actorIdentifierString())),
		/** Exclude posts that link to any of these domains. */
		excludeDomains: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** Exclude posts that embed any of these AT URIs. */
		excludeEmbeddedAtUris: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()),
		),
		/** Exclude posts tagged with any of these hashtags. Do not include the hash (#) prefix. */
		excludeHashtags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64),
				]),
			),
		),
		/** Exclude posts whose language matches any of these language codes. */
		excludeLanguages: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.languageCodeString())),
		/** Exclude posts that mention any of these accounts. Handles are resolved to DIDs before searching. */
		excludeMentions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.actorIdentifierString())),
		/** Exclude replies from results. Mutually exclusive with repliesOnly. */
		excludeReplies: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/** Exclude posts that link to any of these URLs. */
		excludeUrls: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.genericUriString())),
		/** Include only posts from accounts followed by the viewer. */
		following: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/** Include only posts with media. */
		hasMedia: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/** Include only posts with video. */
		hasVideo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/** Include posts tagged with any of these hashtags. Do not include the hash (#) prefix. */
		hashtags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64),
				]),
			),
		),
		/** Include posts whose language matches any of these language codes. */
		languages: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.languageCodeString())),
		/**
		 * Maximum number of results to return.
		 *
		 * @default 25
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			25,
		),
		/** Include posts that mention any of these accounts. Handles are resolved to DIDs before searching. */
		mentions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.actorIdentifierString())),
		/** Search query string. A query or at least one filter is required. */
		query: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Language analyzer hint for the query text. If unset, the server auto-detects when possible. */
		queryLanguage: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'ar' | 'ja' | 'ko' | 'th' | 'zh' | (string & {})>(),
		),
		/** Include only replies. Mutually exclusive with excludeReplies. */
		repliesOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/** Include only direct replies to this parent post URI. */
		replyParentUri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		/** Include posts indexed at or after this timestamp. Can be a datetime, or just an ISO date (YYYY-MM-DD). */
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Ranking order for results. 'recent' sorts by recency; 'top' uses search ranking. */
		sort: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'recent' | 'top' | (string & {})>()),
		/** Include only posts in the thread rooted at this post URI. */
		threadRootUri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		/**
		 * Include posts indexed before this timestamp. Defaults to the current time. Can be a datetime, or just
		 * an ISO date (YYYY-MM-DD).
		 */
		until: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Include posts that link to any of these URLs. */
		urls: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.genericUriString())),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Cursor for the next page of results. */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Query languages detected for CJK, Thai, or Arabic text. Empty or omitted for other scripts. */
			detectedQueryLanguages: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'ar' | 'ja' | 'ko' | 'th' | 'zh' | (string & {})>()),
			),
			/** Estimated total number of matching hits. May be rounded or truncated. */
			hitsTotal: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** Hydrated views of matching posts. */
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
		'app.bsky.feed.searchPostsV2': mainSchema;
	}
}
