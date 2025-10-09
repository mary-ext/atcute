import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ChatBskyConvoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('chat.bsky.convo.removeReaction', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			convoId: /*#__PURE__*/ v.string(),
			messageId: /*#__PURE__*/ v.string(),
			/**
			 * @minLength 1
			 * @maxLength 64
			 * @minGraphemes 1
			 * @maxGraphemes 1
			 */
			value: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(1, 64),
				/*#__PURE__*/ v.stringGraphemes(1, 1),
			]),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get message() {
				return ChatBskyConvoDefs.messageViewSchema;
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'chat.bsky.convo.removeReaction': mainSchema;
	}
}
