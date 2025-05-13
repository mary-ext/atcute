import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.searchPosts', {
	params: /*#__PURE__*/ v.object({
		q: /*#__PURE__*/ v.string(),
		sort: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'top' | 'latest' | (string & {})>(), 'latest'),
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		until: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		mentions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.actorIdentifierString()),
		author: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.actorIdentifierString()),
		lang: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.languageCodeString()),
		domain: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		url: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		tag: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64),
				]),
			),
		),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			25,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.feed.searchPosts': mainSchema;
	}
}
