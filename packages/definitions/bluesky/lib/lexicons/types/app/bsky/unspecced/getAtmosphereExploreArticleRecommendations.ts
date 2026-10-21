import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _articleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getAtmosphereExploreArticleRecommendations#article'),
	),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getAtmosphereExploreArticleRecommendations', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @default 25
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			25,
		),
		/** DID of the account making the request (not included for public/unauthenticated queries). */
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** @maxLength 100 */
			get articles() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(articleSchema), [
					/*#__PURE__*/ v.arrayLength(0, 100),
				]);
			},
			/** Snowflake for this recommendation, use when submitting recommendation events. */
			recIdStr: /*#__PURE__*/ v.string(),
		}),
	},
});

type article$schematype = typeof _articleSchema;
type main$schematype = typeof _mainSchema;

export interface articleSchema extends article$schematype {}
export interface mainSchema extends main$schematype {}

export const articleSchema = _articleSchema as articleSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Article extends v.InferInput<typeof articleSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getAtmosphereExploreArticleRecommendations': mainSchema;
	}
}
