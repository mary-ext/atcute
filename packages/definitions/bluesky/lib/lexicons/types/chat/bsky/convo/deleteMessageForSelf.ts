import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ChatBskyConvoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('chat.bsky.convo.deleteMessageForSelf', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			convoId: /*#__PURE__*/ v.string(),
			messageId: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return ChatBskyConvoDefs.deletedMessageViewSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'chat.bsky.convo.deleteMessageForSelf': mainSchema;
	}
}
