import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoIdentityDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.identity.refreshIdentity', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			identifier: /*#__PURE__*/ v.actorIdentifierString(),
		}),
	},
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
	interface XRPCProcedures {
		'com.atproto.identity.refreshIdentity': mainSchema.$schema;
	}
}
