import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyUnspeccedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.unspecced.initAgeAssurance', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			countryCode: /*#__PURE__*/ v.string(),
			email: /*#__PURE__*/ v.string(),
			language: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return AppBskyUnspeccedDefs.ageAssuranceStateSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'app.bsky.unspecced.initAgeAssurance': mainSchema;
	}
}
