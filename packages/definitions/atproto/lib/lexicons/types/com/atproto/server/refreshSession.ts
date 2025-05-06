import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.server.refreshSession', {
	params: null,
	input: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			accessJwt: /*#__PURE__*/ v.string(),
			refreshJwt: /*#__PURE__*/ v.string(),
			handle: /*#__PURE__*/ v.handleString(),
			did: /*#__PURE__*/ v.didString(),
			didDoc: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			status: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<'takendown' | 'suspended' | 'deactivated' | (string & {})>(),
			),
		}),
	},
});

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.refreshSession': main$schema;
	}
}
