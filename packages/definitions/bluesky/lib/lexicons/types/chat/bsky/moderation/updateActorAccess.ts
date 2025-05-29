import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('chat.bsky.moderation.updateActorAccess', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			actor: /*#__PURE__*/ v.didString(),
			allowAccess: /*#__PURE__*/ v.boolean(),
			ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'chat.bsky.moderation.updateActorAccess': mainSchema;
	}
}
