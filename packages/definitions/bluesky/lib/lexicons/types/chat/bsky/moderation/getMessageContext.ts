import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ChatBskyConvoDefs from '../convo/defs.js';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.moderation.getMessageContext', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @default 5
		 */
		after: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 5),
		/**
		 * @default 5
		 */
		before: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 5),
		/**
		 * Conversation that the message is from. NOTE: this field will eventually be required.
		 */
		convoId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		messageId: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get messages() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						ChatBskyConvoDefs.deletedMessageViewSchema,
						ChatBskyConvoDefs.messageViewSchema,
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
		'chat.bsky.moderation.getMessageContext': mainSchema;
	}
}
