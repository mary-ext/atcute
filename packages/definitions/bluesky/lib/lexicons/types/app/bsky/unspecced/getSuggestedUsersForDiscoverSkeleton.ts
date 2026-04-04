import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getSuggestedUsersForDiscoverSkeleton', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @minimum 1
		 * @maximum 50
		 * @default 25
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 50)]),
			25,
		),
		/**
		 * DID of the account making the request (not included for public/unauthenticated queries).
		 */
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			dids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
			/**
			 * Snowflake for this recommendation, use when submitting recommendation events.
			 */
			recIdStr: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'app.bsky.unspecced.getSuggestedUsersForDiscoverSkeleton': mainSchema;
	}
}
