import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.server.getServiceAuth', {
	params: /*#__PURE__*/ v.object({
		aud: /*#__PURE__*/ v.didString(),
		exp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		lxm: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nsidString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			token: /*#__PURE__*/ v.string(),
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
		'com.atproto.server.getServiceAuth': mainSchema.$schema;
	}
}
