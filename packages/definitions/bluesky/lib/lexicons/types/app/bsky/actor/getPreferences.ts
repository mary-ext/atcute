import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.actor.getPreferences', {
	params: /*#__PURE__*/ v.object({}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get preferences() {
				return AppBskyActorDefs.preferencesSchema;
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
		'app.bsky.actor.getPreferences': mainSchema;
	}
}
