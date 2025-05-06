import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.admin.disableAccountInvites', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			account: /*#__PURE__*/ v.didString(),
			note: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.admin.disableAccountInvites': main$schema;
	}
}
