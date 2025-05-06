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

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.getServiceAuth': main$schema;
	}
}
