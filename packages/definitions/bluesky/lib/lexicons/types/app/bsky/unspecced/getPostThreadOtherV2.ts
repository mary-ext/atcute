import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyUnspeccedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getPostThreadOtherV2', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Reference (AT-URI) to post record. This is the anchor post.
		 */
		anchor: /*#__PURE__*/ v.resourceUriString(),
		/**
		 * Whether to prioritize posts from followed users. It only has effect when the user is authenticated.
		 * @default false
		 */
		prioritizeFollowedUsers: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * A flat list of other thread items. The depth of each item is indicated by the depth property inside the item.
			 */
			get thread() {
				return /*#__PURE__*/ v.array(threadItemSchema);
			},
		}),
	},
});
const _threadItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getPostThreadOtherV2#threadItem'),
	),
	/**
	 * The nesting level of this item in the thread. Depth 0 means the anchor item. Items above have negative depths, items below have positive depths.
	 */
	depth: /*#__PURE__*/ v.integer(),
	uri: /*#__PURE__*/ v.resourceUriString(),
	get value() {
		return /*#__PURE__*/ v.variant([AppBskyUnspeccedDefs.threadItemPostSchema]);
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
		'app.bsky.unspecced.getPostThreadOtherV2': mainSchema;
	}
}
