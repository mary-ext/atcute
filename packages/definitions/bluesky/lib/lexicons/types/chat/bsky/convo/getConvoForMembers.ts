import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ChatBskyConvoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.convo.getConvoForMembers', {
	params: /*#__PURE__*/ v.object({
		members: /*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.didString()), [
			/*#__PURE__*/ v.arrayLength(1, 10),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get convo() {
				return ChatBskyConvoDefs.convoViewSchema;
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'chat.bsky.convo.getConvoForMembers': mainSchema;
	}
}
