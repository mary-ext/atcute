import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.actor.searchActorsTypeahead', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 10
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			10,
		),
		/**
		 * Search query prefix; not a full query string.
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
				return /*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema);
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
		'app.bsky.actor.searchActorsTypeahead': mainSchema;
	}
}
