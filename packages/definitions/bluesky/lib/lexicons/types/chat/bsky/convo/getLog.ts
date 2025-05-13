import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ChatBskyConvoDefs from './defs.js';

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
						ChatBskyConvoDefs.logBeginConvoSchema,
						ChatBskyConvoDefs.logAcceptConvoSchema,
						ChatBskyConvoDefs.logLeaveConvoSchema,
						ChatBskyConvoDefs.logMuteConvoSchema,
						ChatBskyConvoDefs.logUnmuteConvoSchema,
						ChatBskyConvoDefs.logCreateMessageSchema,
						ChatBskyConvoDefs.logDeleteMessageSchema,
						ChatBskyConvoDefs.logReadMessageSchema,
						ChatBskyConvoDefs.logAddReactionSchema,
						ChatBskyConvoDefs.logRemoveReactionSchema,
					]),
				);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'chat.bsky.convo.getLog': mainSchema;
	}
}
