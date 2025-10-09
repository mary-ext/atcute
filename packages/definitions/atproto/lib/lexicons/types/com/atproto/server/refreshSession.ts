import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.server.refreshSession', {
	params: null,
	input: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			accessJwt: /*#__PURE__*/ v.string(),
			active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			did: /*#__PURE__*/ v.didString(),
			didDoc: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			handle: /*#__PURE__*/ v.handleString(),
			refreshJwt: /*#__PURE__*/ v.string(),
			/**
			 * Hosting status of the account. If not specified, then assume 'active'.
			 */
			status: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<'deactivated' | 'suspended' | 'takendown' | (string & {})>(),
			),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.refreshSession': mainSchema;
	}
}
