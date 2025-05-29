import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _liveNowConfigSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.getConfig#liveNowConfig')),
	did: /*#__PURE__*/ v.didString(),
	domains: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});
const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getConfig', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			checkEmailConfirmed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			get liveNow() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(liveNowConfigSchema));
			},
		}),
	},
});

type liveNowConfig$schematype = typeof _liveNowConfigSchema;
type main$schematype = typeof _mainSchema;

export interface liveNowConfigSchema extends liveNowConfig$schematype {}
export interface mainSchema extends main$schematype {}

export const liveNowConfigSchema = _liveNowConfigSchema as liveNowConfigSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface LiveNowConfig extends v.InferInput<typeof liveNowConfigSchema> {}

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getConfig': mainSchema;
	}
}
