import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.temp.checkSignupQueue', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			activated: /*#__PURE__*/ v.boolean(),
			placeInQueue: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			estimatedTimeMs: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		}),
	},
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.temp.checkSignupQueue': mainSchema.$schema;
	}
}
