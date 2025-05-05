import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.identity.getRecommendedDidCredentials', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			rotationKeys: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			alsoKnownAs: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			verificationMethods: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			services: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
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
		'com.atproto.identity.getRecommendedDidCredentials': mainSchema.$schema;
	}
}
