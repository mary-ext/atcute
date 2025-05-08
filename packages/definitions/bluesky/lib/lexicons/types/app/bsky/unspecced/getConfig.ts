import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('app.bsky.unspecced.getConfig', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			checkEmailConfirmed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getConfig': mainSchema;
	}
}
