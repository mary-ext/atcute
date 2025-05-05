import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoIdentityDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.identity.resolveIdentity', {
	params: /*#__PURE__*/ v.object({
		identifier: /*#__PURE__*/ v.actorIdentifierString(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return ComAtprotoIdentityDefs.identityInfoSchema;
		},
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
		'com.atproto.identity.resolveIdentity': mainSchema.$schema;
	}
}
