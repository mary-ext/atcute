import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyFeedDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.getTimeline', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Variant 'algorithm' for timeline. Implementation-specific. NOTE: most feed flexibility has been moved
		 * to feed generator mechanism.
		 */
		algorithm: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * Return only items newer than the position identified by this cursor value, newest first. Use the
		 * startCursor from a previous response. The item at that position is not returned because the caller
		 * already holds it. When the bounded range is exhausted, the returned cursor equals this value so that
		 * pagination continues below the boundary.
		 */
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get feed() {
				return /*#__PURE__*/ v.array(AppBskyFeedDefs.feedViewPostSchema);
			},
			/**
			 * Cursor identifying the newest item in this page. Pass it as since on a later request to fetch only
			 * newer content.
			 */
			startCursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'app.bsky.feed.getTimeline': mainSchema;
	}
}
