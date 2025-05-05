import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.server.getSession', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			handle: /*#__PURE__*/ v.handleString(),
			did: /*#__PURE__*/ v.didString(),
			email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			emailConfirmed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			emailAuthFactor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			didDoc: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'com.atproto.server.getSession': mainSchema.$schema;
	}
}
