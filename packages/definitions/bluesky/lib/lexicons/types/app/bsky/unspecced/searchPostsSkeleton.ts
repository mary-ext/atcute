import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyUnspeccedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.searchPostsSkeleton', {
	params: /*#__PURE__*/ v.object({
		author: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.actorIdentifierString()),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		domain: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		lang: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.languageCodeString()),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			25,
		),
		mentions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.actorIdentifierString()),
		q: /*#__PURE__*/ v.string(),
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		sort: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'latest' | 'top' | (string & {})>(), 'latest'),
		tag: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
					/*#__PURE__*/ v.stringLength(0, 640),
					/*#__PURE__*/ v.stringGraphemes(0, 64),
				]),
			),
		),
		until: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		url: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			hitsTotal: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			get posts() {
				return /*#__PURE__*/ v.array(AppBskyUnspeccedDefs.skeletonSearchPostSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.searchPostsSkeleton': mainSchema;
	}
}
