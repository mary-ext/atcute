import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyActorDefs from '../actor/defs.ts';

import * as ChatBskyConvoDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.convo.getMessages', {
	params: /*#__PURE__*/ v.object({
		convoId: /*#__PURE__*/ v.string(),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get messages() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						ChatBskyConvoDefs.deletedMessageViewSchema,
						ChatBskyConvoDefs.messageViewSchema,
						ChatBskyConvoDefs.systemMessageViewSchema,
					]),
				);
			},
			/**
			 * Set of all members who authored or reacted to the returned messages. Members referred to by system
			 * messages are also included.
			 */
			get relatedProfiles() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema));
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
		'chat.bsky.convo.getMessages': mainSchema;
	}
}
