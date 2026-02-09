import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyAgeassuranceDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.ageassurance.getState', {
	params: /*#__PURE__*/ v.object({
		countryCode: /*#__PURE__*/ v.string(),
		regionCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get metadata() {
				return AppBskyAgeassuranceDefs.stateMetadataSchema;
			},
			get state() {
				return AppBskyAgeassuranceDefs.stateSchema;
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
		'app.bsky.ageassurance.getState': mainSchema;
	}
}
