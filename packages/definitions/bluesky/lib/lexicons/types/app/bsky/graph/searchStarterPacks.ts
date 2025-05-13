import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyGraphDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.graph.searchStarterPacks', {
	params: /*#__PURE__*/ v.object({
		q: /*#__PURE__*/ v.string(),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			25,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get starterPacks() {
				return /*#__PURE__*/ v.array(AppBskyGraphDefs.starterPackViewBasicSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.graph.searchStarterPacks': mainSchema;
	}
}
