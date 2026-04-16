import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyConvoDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.convo.getLog', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get logs() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						ChatBskyConvoDefs.logAcceptConvoSchema,
						ChatBskyConvoDefs.logAddMemberSchema,
						ChatBskyConvoDefs.logAddReactionSchema,
						ChatBskyConvoDefs.logApproveJoinRequestSchema,
						ChatBskyConvoDefs.logBeginConvoSchema,
						ChatBskyConvoDefs.logCreateJoinLinkSchema,
						ChatBskyConvoDefs.logCreateMessageSchema,
						ChatBskyConvoDefs.logDeleteMessageSchema,
						ChatBskyConvoDefs.logDisableJoinLinkSchema,
						ChatBskyConvoDefs.logEditGroupSchema,
						ChatBskyConvoDefs.logEditJoinLinkSchema,
						ChatBskyConvoDefs.logEnableJoinLinkSchema,
						ChatBskyConvoDefs.logIncomingJoinRequestSchema,
						ChatBskyConvoDefs.logLeaveConvoSchema,
						ChatBskyConvoDefs.logLockConvoSchema,
						ChatBskyConvoDefs.logLockConvoPermanentlySchema,
						ChatBskyConvoDefs.logMemberJoinSchema,
						ChatBskyConvoDefs.logMemberLeaveSchema,
						ChatBskyConvoDefs.logMuteConvoSchema,
						ChatBskyConvoDefs.logOutgoingJoinRequestSchema,
						ChatBskyConvoDefs.logReadConvoSchema,
						ChatBskyConvoDefs.logReadMessageSchema,
						ChatBskyConvoDefs.logRejectJoinRequestSchema,
						ChatBskyConvoDefs.logRemoveMemberSchema,
						ChatBskyConvoDefs.logRemoveReactionSchema,
						ChatBskyConvoDefs.logUnlockConvoSchema,
						ChatBskyConvoDefs.logUnmuteConvoSchema,
					]),
				);
			},
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
		'chat.bsky.convo.getLog': mainSchema;
	}
}
