import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyUnspeccedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('app.bsky.unspecced.searchActorsSkeleton', {
	params: /*#__PURE__*/ v.object({
		q: /*#__PURE__*/ v.string(),
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		typeahead: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
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
			hitsTotal: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			get actors() {
				return /*#__PURE__*/ v.array(AppBskyUnspeccedDefs.skeletonSearchActorSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.searchActorsSkeleton': mainSchema;
	}
}
