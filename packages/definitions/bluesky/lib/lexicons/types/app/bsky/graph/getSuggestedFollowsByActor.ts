import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from '../actor/defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.graph.getSuggestedFollowsByActor', {
	params: /*#__PURE__*/ v.object({
		actor: /*#__PURE__*/ v.actorIdentifierString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * If true, response has fallen-back to generic results, and is not scoped using relativeToDid
			 * @default false
			 */
			isFallback: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
			/**
			 * Snowflake for this recommendation, use when submitting recommendation events.
			 */
			recId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			get suggestions() {
				return /*#__PURE__*/ v.array(AppBskyActorDefs.profileViewSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.graph.getSuggestedFollowsByActor': mainSchema;
	}
}
