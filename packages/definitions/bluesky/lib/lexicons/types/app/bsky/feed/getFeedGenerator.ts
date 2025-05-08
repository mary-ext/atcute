import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('app.bsky.feed.getFeedGenerator', {
	params: /*#__PURE__*/ v.object({
		feed: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get view() {
				return AppBskyFeedDefs.generatorViewSchema;
			},
			isOnline: /*#__PURE__*/ v.boolean(),
			isValid: /*#__PURE__*/ v.boolean(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.feed.getFeedGenerator': mainSchema;
	}
}
