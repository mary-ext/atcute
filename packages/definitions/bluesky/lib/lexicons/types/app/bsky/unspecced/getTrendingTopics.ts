import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyUnspeccedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getTrendingTopics', {
	params: /*#__PURE__*/ v.object({
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 25)]),
			10,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get topics() {
				return /*#__PURE__*/ v.array(AppBskyUnspeccedDefs.trendingTopicSchema);
			},
			get suggested() {
				return /*#__PURE__*/ v.array(AppBskyUnspeccedDefs.trendingTopicSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getTrendingTopics': mainSchema;
	}
}
