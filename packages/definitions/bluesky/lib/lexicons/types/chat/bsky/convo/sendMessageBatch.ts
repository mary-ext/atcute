import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ChatBskyConvoDefs from './defs.js';

const _batchItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.convo.sendMessageBatch#batchItem')),
	convoId: /*#__PURE__*/ v.string(),
	get message() {
		return ChatBskyConvoDefs.messageInputSchema;
	},
});
const _mainSchema = /*#__PURE__*/ v.procedure('chat.bsky.convo.sendMessageBatch', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * @maxLength 100
			 */
			get items() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(batchItemSchema), [
					/*#__PURE__*/ v.arrayLength(0, 100),
				]);
			},
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get items() {
				return /*#__PURE__*/ v.array(ChatBskyConvoDefs.messageViewSchema);
			},
		}),
	},
});

type batchItem$schematype = typeof _batchItemSchema;
type main$schematype = typeof _mainSchema;

export interface batchItemSchema extends batchItem$schematype {}
export interface mainSchema extends main$schematype {}

export const batchItemSchema = _batchItemSchema as batchItemSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface BatchItem extends v.InferInput<typeof batchItemSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'chat.bsky.convo.sendMessageBatch': mainSchema;
	}
}
