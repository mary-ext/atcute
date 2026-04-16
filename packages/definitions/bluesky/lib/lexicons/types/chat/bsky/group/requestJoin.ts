import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyConvoDefs from '../convo/defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('chat.bsky.group.requestJoin', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			code: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The group convo joined. This is only present in the case of status=joined
			 */
			get convo() {
				return /*#__PURE__*/ v.optional(ChatBskyConvoDefs.convoViewSchema);
			},
			status: /*#__PURE__*/ v.string<'joined' | 'pending' | (string & {})>(),
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
		'chat.bsky.group.requestJoin': mainSchema;
	}
}
