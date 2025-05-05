import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.identity.resolveHandle', {
	params: /*#__PURE__*/ v.object({
		handle: /*#__PURE__*/ v.handleString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			did: /*#__PURE__*/ v.didString(),
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
		'com.atproto.identity.resolveHandle': mainSchema.$schema;
	}
}
