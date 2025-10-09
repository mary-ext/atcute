import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.server.getSession', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			did: /*#__PURE__*/ v.didString(),
			didDoc: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			emailAuthFactor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			emailConfirmed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			handle: /*#__PURE__*/ v.handleString(),
			/**
			 * If active=false, this optional field indicates a possible reason for why the account is not active. If active=false and no status is supplied, then the host makes no claim for why the repository is no longer being hosted.
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
	interface XRPCQueries {
		'com.atproto.server.getSession': mainSchema;
	}
}
