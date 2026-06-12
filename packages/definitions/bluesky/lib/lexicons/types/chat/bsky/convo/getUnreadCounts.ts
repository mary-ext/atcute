import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.convo.getUnreadCounts', {
	params: /*#__PURE__*/ v.object({
		/**
		 * When false, group convos are excluded from the counts.
		 *
		 * @default true
		 */
		includeGroupChats: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Number of unread, unlocked accepted convos. Counts convos with unread messages and unread join
			 * requests. Capped at 31, where 31 means more than 30.
			 */
			unreadAcceptedConvos: /*#__PURE__*/ v.integer(),
			/**
			 * Number of unread, unlocked request convos. Includes convos with unread messages, but not with unread
			 * join request, since only the owner of a group has join requests to read, and the group would
			 * necessarily be accepted. Capped at 11, where 11 means more than 10.
			 */
			unreadRequestConvos: /*#__PURE__*/ v.integer(),
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
		'chat.bsky.convo.getUnreadCounts': mainSchema;
	}
}
