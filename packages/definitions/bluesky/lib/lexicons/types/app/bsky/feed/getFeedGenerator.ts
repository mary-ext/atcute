import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.getFeedGenerator', {
	params: /*#__PURE__*/ v.object({
		/**
		 * AT-URI of the feed generator record.
		 */
		feed: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Indicates whether the feed generator service has been online recently, or else seems to be inactive.
			 */
			isOnline: /*#__PURE__*/ v.boolean(),
			/**
			 * Indicates whether the feed generator service is compatible with the record declaration.
			 */
			isValid: /*#__PURE__*/ v.boolean(),
			get view() {
				return AppBskyFeedDefs.generatorViewSchema;
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
		'app.bsky.feed.getFeedGenerator': mainSchema;
	}
}
