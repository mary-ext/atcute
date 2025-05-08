import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('app.bsky.unspecced.getSuggestedUsersSkeleton', {
	params: /*#__PURE__*/ v.object({
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		category: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 50)]),
			25,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			dids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getSuggestedUsersSkeleton': mainSchema;
	}
}
