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

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.identity.refreshIdentity': mainSchema;
	}
}
