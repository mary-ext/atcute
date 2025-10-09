import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getSuggestedStarterPacksSkeleton', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @minimum 1
		 * @maximum 25
		 * @default 10
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 25)]),
			10,
		),
		/**
		 * DID of the account making the request (not included for public/unauthenticated queries).
		 */
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			starterPacks: /*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()),
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
		'app.bsky.unspecced.getSuggestedStarterPacksSkeleton': mainSchema;
	}
}
