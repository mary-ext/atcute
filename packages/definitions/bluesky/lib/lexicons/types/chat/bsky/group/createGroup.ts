import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyConvoDefs from '../convo/defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('chat.bsky.group.createGroup', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The members to add to the group. The owner is automatically added. Implementations may enforce a
			 * lower maximum than the 10,000-item schema limit; Bluesky currently supports up to 100 total members.
			 * If the owner is included in this list, the list may contain up to the implementation's total member
			 * limit. Otherwise, it may contain one fewer.
			 *
			 * @maxLength 10000
			 */
			members: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
				/*#__PURE__*/ v.arrayLength(0, 10000),
			]),
			/**
			 * @minLength 1
			 * @maxLength 500
			 * @maxGraphemes 50
			 */
			name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(1, 500),
				/*#__PURE__*/ v.stringGraphemes(0, 50),
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
		'chat.bsky.group.createGroup': mainSchema;
	}
}
