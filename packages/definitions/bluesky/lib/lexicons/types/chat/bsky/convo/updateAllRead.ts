import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('chat.bsky.convo.updateAllRead', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'request' | 'accepted' | (string & {})>()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			updatedCount: /*#__PURE__*/ v.integer(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'chat.bsky.convo.updateAllRead': mainSchema;
	}
}
