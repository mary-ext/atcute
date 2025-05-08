import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from '../actor/defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('app.bsky.graph.getSuggestedFollowsByActor', {
	params: /*#__PURE__*/ v.object({
		actor: /*#__PURE__*/ v.actorIdentifierString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get suggestions() {
				return /*#__PURE__*/ v.array(AppBskyActorDefs.profileViewSchema);
			},
			isFallback: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
			recId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.graph.getSuggestedFollowsByActor': mainSchema;
	}
}
