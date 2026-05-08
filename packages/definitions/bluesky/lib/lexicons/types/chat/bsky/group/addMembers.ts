import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyActorDefs from '../actor/defs.ts';
import * as ChatBskyConvoDefs from '../convo/defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('chat.bsky.group.addMembers', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			convoId: /*#__PURE__*/ v.string(),
			/**
			 * @minLength 1
			 */
			members: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
				/*#__PURE__*/ v.arrayLength(1),
			]),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get addedMembers() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ChatBskyActorDefs.profileViewBasicSchema));
			},
			get convo() {
				return ChatBskyConvoDefs.convoViewSchema;
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
		'chat.bsky.group.addMembers': mainSchema;
	}
}
