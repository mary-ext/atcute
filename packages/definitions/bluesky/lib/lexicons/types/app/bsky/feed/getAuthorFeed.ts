import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.getAuthorFeed', {
	params: /*#__PURE__*/ v.object({
		actor: /*#__PURE__*/ v.actorIdentifierString(),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Combinations of post/repost types to include in response.
		 * @default "posts_with_replies"
		 */
		filter: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<
				| 'posts_and_author_threads'
				| 'posts_no_replies'
				| 'posts_with_media'
				| 'posts_with_replies'
				| 'posts_with_video'
				| (string & {})
			>(),
			'posts_with_replies',
		),
		/**
		 * @default false
		 */
		includePins: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
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

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.feed.getAuthorFeed': mainSchema;
	}
}
