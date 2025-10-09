import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ChatBskyConvoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.convo.listConvos', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		readState: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'unread' | (string & {})>()),
		status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'accepted' | 'request' | (string & {})>()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get convos() {
				return /*#__PURE__*/ v.array(ChatBskyConvoDefs.convoViewSchema);
			},
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'chat.bsky.convo.listConvos': mainSchema;
	}
}
