import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyConvoDefs from '../convo/defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.moderation.getMessageContext', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Number of user messages after the target to include. System messages between the target and the latest
		 * returned user message are also included, capped per gap by `maxInterleavedSystemMessages`. If there are
		 * no user messages after the target, up to `maxInterleavedSystemMessages` system messages immediately
		 * following the target are returned instead.
		 *
		 * @default 5
		 */
		after: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 5),
		/**
		 * Number of user messages before the target to include. System messages between the earliest returned
		 * user message and the target are also included, capped per gap by `maxInterleavedSystemMessages`. If
		 * there are no user messages before the target, up to `maxInterleavedSystemMessages` system messages
		 * immediately preceding the target are returned instead.
		 *
		 * @default 5
		 */
		before: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 5),
		/** Conversation that the message is from. NOTE: this field will eventually be required. */
		convoId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of system messages to include per gap between consecutive returned messages (and per
		 * side when there are no user messages on that side). Within a gap, the system messages closest to the
		 * earlier message are kept.
		 *
		 * @default 10
		 * @minimum 0
		 * @maximum 1000
		 */
		maxInterleavedSystemMessages: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 1000)]),
			10,
		),
		messageId: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get messages() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						ChatBskyConvoDefs.messageViewSchema,
						ChatBskyConvoDefs.systemMessageViewSchema,
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
