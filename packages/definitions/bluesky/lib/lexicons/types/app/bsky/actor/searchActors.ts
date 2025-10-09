import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.actor.searchActors', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 25
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			25,
		),
		/**
		 * Search query string. Syntax, phrase, boolean, and faceting is unspecified, but Lucene query syntax is recommended.
		 */
		q: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * DEPRECATED: use 'q' instead.
		 * @deprecated
		 */
		term: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get actors() {
				return /*#__PURE__*/ v.array(AppBskyActorDefs.profileViewSchema);
			},
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'app.bsky.actor.searchActors': mainSchema;
	}
}
