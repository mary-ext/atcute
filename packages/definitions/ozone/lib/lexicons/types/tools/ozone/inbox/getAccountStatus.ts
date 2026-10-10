import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.inbox.getAccountStatus', {
	params: /*#__PURE__*/ v.object({
		/** Account to preview. Only Ozone staff can read another account; this does not change its read state. */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Time at which the current suspension expires. Present only for a temporary suspension. */
			expiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			/** DID of the moderation service returning this status. */
			src: /*#__PURE__*/ v.didString(),
			standing: /*#__PURE__*/ v.string<'atRisk' | 'good' | 'warning' | (string & {})>(),
			/**
			 * Newest account-status update or strike timestamp used to derive this standing, or the Unix epoch when
			 * neither exists. This is not a standing-transition timestamp; expiry can change standing without
			 * changing this value.
			 */
			updatedAt: /*#__PURE__*/ v.datetimeString(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.inbox.getAccountStatus': mainSchema;
	}
}
