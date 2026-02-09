import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyActorDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.actor.getProfile', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Handle or DID of account to fetch profile of.
		 */
		actor: /*#__PURE__*/ v.actorIdentifierString(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return AppBskyActorDefs.profileViewDetailedSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.actor.getProfile': mainSchema;
	}
}
