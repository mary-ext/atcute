import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.getAuthorFeed', {
	params: /*#__PURE__*/ v.object({
		actor: /*#__PURE__*/ v.actorIdentifierString(),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		filter: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<
				| 'posts_with_replies'
				| 'posts_no_replies'
				| 'posts_with_media'
				| 'posts_and_author_threads'
				| 'posts_with_video'
				| (string & {})
			>(),
			'posts_with_replies',
		),
		includePins: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get feed() {
				return /*#__PURE__*/ v.array(AppBskyFeedDefs.feedViewPostSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.feed.getAuthorFeed': mainSchema;
	}
}
