import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyAgeassuranceDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.ageassurance.getConfig', {
	params: null,
	output: {
		type: 'lex',
		get schema() {
			return AppBskyAgeassuranceDefs.configSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.ageassurance.getConfig': mainSchema;
	}
}
