import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from '../feed/defs.js';
import * as AppBskyUnspeccedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getPostThreadV2', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Whether to include parents above the anchor.
		 * @default true
		 */
		above: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
		/**
		 * Reference (AT-URI) to post record. This is the anchor post, and the thread will be built around it. It can be any post in the tree, not necessarily a root post.
		 */
		anchor: /*#__PURE__*/ v.resourceUriString(),
		/**
		 * How many levels of replies to include below the anchor.
		 * @minimum 0
		 * @maximum 20
		 * @default 6
		 */
		below: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 20)]),
			6,
		),
		/**
		 * Maximum of replies to include at each level of the thread, except for the direct replies to the anchor, which are (NOTE: currently, during unspecced phase) all returned (NOTE: later they might be paginated).
		 * @minimum 0
		 * @maximum 100
		 * @default 10
		 */
		branchingFactor: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
			10,
		),
		/**
		 * Whether to prioritize posts from followed users. It only has effect when the user is authenticated.
		 * @default false
		 */
		prioritizeFollowedUsers: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		/**
		 * Sorting for the thread replies.
		 * @default "oldest"
		 */
		sort: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'newest' | 'oldest' | 'top' | (string & {})>(),
			'oldest',
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Whether this thread has additional replies. If true, a call can be made to the `getPostThreadOtherV2` endpoint to retrieve them.
			 */
			hasOtherReplies: /*#__PURE__*/ v.boolean(),
			/**
			 * A flat list of thread items. The depth of each item is indicated by the depth property inside the item.
			 */
			get thread() {
				return /*#__PURE__*/ v.array(threadItemSchema);
			},
			get threadgate() {
				return /*#__PURE__*/ v.optional(AppBskyFeedDefs.threadgateViewSchema);
			},
		}),
	},
});
const _threadItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.getPostThreadV2#threadItem')),
	/**
	 * The nesting level of this item in the thread. Depth 0 means the anchor item. Items above have negative depths, items below have positive depths.
	 */
	depth: /*#__PURE__*/ v.integer(),
	uri: /*#__PURE__*/ v.resourceUriString(),
	get value() {
		return /*#__PURE__*/ v.variant([
			AppBskyUnspeccedDefs.threadItemBlockedSchema,
			AppBskyUnspeccedDefs.threadItemNoUnauthenticatedSchema,
			AppBskyUnspeccedDefs.threadItemNotFoundSchema,
			AppBskyUnspeccedDefs.threadItemPostSchema,
		]);
	},
});

type main$schematype = typeof _mainSchema;
type threadItem$schematype = typeof _threadItemSchema;

export interface mainSchema extends main$schematype {}
export interface threadItemSchema extends threadItem$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const threadItemSchema = _threadItemSchema as threadItemSchema;

export interface ThreadItem extends v.InferInput<typeof threadItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getPostThreadV2': mainSchema;
	}
}
