import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.getPostThread', {
	params: /*#__PURE__*/ v.object({
		uri: /*#__PURE__*/ v.resourceUriString(),
		depth: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 1000)]),
			6,
		),
		parentHeight: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 1000)]),
			80,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get thread() {
				return /*#__PURE__*/ v.variant([
					AppBskyFeedDefs.threadViewPostSchema,
					AppBskyFeedDefs.notFoundPostSchema,
					AppBskyFeedDefs.blockedPostSchema,
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

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.feed.getPostThread': mainSchema;
	}
}
