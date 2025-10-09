import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.getPostThread', {
	params: /*#__PURE__*/ v.object({
		/**
		 * How many levels of reply depth should be included in response.
		 * @minimum 0
		 * @maximum 1000
		 * @default 6
		 */
		depth: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 1000)]),
			6,
		),
		/**
		 * How many levels of parent (and grandparent, etc) post to include.
		 * @minimum 0
		 * @maximum 1000
		 * @default 80
		 */
		parentHeight: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 1000)]),
			80,
		),
		/**
		 * Reference (AT-URI) to post record.
		 */
		uri: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get thread() {
				return /*#__PURE__*/ v.variant([
					AppBskyFeedDefs.blockedPostSchema,
					AppBskyFeedDefs.notFoundPostSchema,
					AppBskyFeedDefs.threadViewPostSchema,
				]);
			},
			get threadgate() {
				return /*#__PURE__*/ v.optional(AppBskyFeedDefs.threadgateViewSchema);
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
		'app.bsky.feed.getPostThread': mainSchema;
	}
}
