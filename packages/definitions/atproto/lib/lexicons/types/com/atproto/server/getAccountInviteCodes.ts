import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoServerDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.server.getAccountInviteCodes', {
	params: /*#__PURE__*/ v.object({
		includeUsed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
		createAvailable: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get codes() {
				return /*#__PURE__*/ v.array(ComAtprotoServerDefs.inviteCodeSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.getAccountInviteCodes': main$schema;
	}
}
