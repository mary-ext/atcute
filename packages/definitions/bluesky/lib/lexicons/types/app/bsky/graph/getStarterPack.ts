import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyGraphDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.graph.getStarterPack', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Reference (AT-URI) of the starter pack record.
		 */
		starterPack: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get starterPack() {
				return AppBskyGraphDefs.starterPackViewSchema;
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
		'app.bsky.graph.getStarterPack': mainSchema;
	}
}
