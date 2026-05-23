import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.actor.getStatus', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Whether the viewer's account is allowed to create group chats. New accounts are restricted from
			 * creating groups.
			 */
			canCreateGroups: /*#__PURE__*/ v.boolean(),
			/** True when the viewer's account is disabled and cannot actively participate in chat. */
			chatDisabled: /*#__PURE__*/ v.boolean(),
			/** The maximum number of members allowed in a group conversation. */
			groupMemberLimit: /*#__PURE__*/ v.integer(),
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
		'chat.bsky.actor.getStatus': mainSchema;
	}
}
