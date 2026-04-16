import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyConvoDefs from '../convo/defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('chat.bsky.group.editGroup', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			convoId: /*#__PURE__*/ v.string(),
			/**
			 * @minLength 1
			 * @maxLength 1280
			 * @maxGraphemes 128
			 */
			name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(1, 1280),
				/*#__PURE__*/ v.stringGraphemes(0, 128),
			]),
		}),
	},
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

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'chat.bsky.group.editGroup': mainSchema;
	}
}
