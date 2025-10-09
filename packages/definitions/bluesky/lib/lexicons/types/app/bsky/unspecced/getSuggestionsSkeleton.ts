import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyUnspeccedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getSuggestionsSkeleton', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * DID of the account to get suggestions relative to. If not provided, suggestions will be based on the viewer.
		 */
		relativeToDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * DID of the account making the request (not included for public/unauthenticated queries). Used to boost followed accounts in ranking.
		 */
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get actors() {
				return /*#__PURE__*/ v.array(AppBskyUnspeccedDefs.skeletonSearchActorSchema);
			},
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Snowflake for this recommendation, use when submitting recommendation events.
			 */
			recId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/**
			 * DID of the account these suggestions are relative to. If this is returned undefined, suggestions are based on the viewer.
			 */
			relativeToDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
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
		'app.bsky.unspecced.getSuggestionsSkeleton': mainSchema;
	}
}
