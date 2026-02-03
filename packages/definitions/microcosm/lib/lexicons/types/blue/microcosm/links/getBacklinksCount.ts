import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('blue.microcosm.links.getBacklinksCount', {
	params: /*#__PURE__*/ v.object({
		/**
		 * collection and path specification for the primary link
		 */
		source: /*#__PURE__*/ v.string(),
		/**
		 * the target being linked to (at-uri, did, or uri)
		 */
		subject: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * total number of matching links
			 */
			total: /*#__PURE__*/ v.integer(),
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
		'blue.microcosm.links.getBacklinksCount': mainSchema;
	}
}
