import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('fyi.frontpage.feed.getFeedSkeleton', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** AT URI of the feed generator record. */
		feed: /*#__PURE__*/ v.resourceUriString(),
		/**
		 * Maximum number of items to return.
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 100
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
				return /*#__PURE__*/ v.array(skeletonFeedPostSchema);
			},
		}),
	},
});
const _skeletonFeedPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('fyi.frontpage.feed.getFeedSkeleton#skeletonFeedPost'),
	),
	/** AT URI of the post. */
	post: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type skeletonFeedPost$schematype = typeof _skeletonFeedPostSchema;

export interface mainSchema extends main$schematype {}
export interface skeletonFeedPostSchema extends skeletonFeedPost$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const skeletonFeedPostSchema = _skeletonFeedPostSchema as skeletonFeedPostSchema;

export interface SkeletonFeedPost extends v.InferInput<typeof skeletonFeedPostSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'fyi.frontpage.feed.getFeedSkeleton': mainSchema;
	}
}
