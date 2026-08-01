import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.graph.muteActor', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			actor: /*#__PURE__*/ v.actorIdentifierString(),
			/** Restrict the mute to the account's quote posts. See onlyReposts. */
			onlyQuoteposts: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Restrict the mute to the account's reposts. When any 'only' scope is set, just the scoped content is
			 * muted; when none are set, the account is fully muted. Repeat calls replace the stored scope rather
			 * than adding to it.
			 */
			onlyReposts: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
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
		'app.bsky.graph.muteActor': mainSchema;
	}
}
