import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.server.getSession', {
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
			status: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<'takendown' | 'suspended' | 'deactivated' | (string & {})>(),
			),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.getSession': mainSchema;
	}
}
