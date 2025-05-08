import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ChatBskyConvoDefs from '../convo/defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('chat.bsky.moderation.getMessageContext', {
	params: /*#__PURE__*/ v.object({
		convoId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		messageId: /*#__PURE__*/ v.string(),
		before: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 5),
		after: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 5),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get messages() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						ChatBskyConvoDefs.messageViewSchema,
						ChatBskyConvoDefs.deletedMessageViewSchema,
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
		'chat.bsky.moderation.getMessageContext': mainSchema;
	}
}
