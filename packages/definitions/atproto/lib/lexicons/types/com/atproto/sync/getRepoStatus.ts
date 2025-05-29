import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.getRepoStatus', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			active: /*#__PURE__*/ v.boolean(),
			did: /*#__PURE__*/ v.didString(),
			rev: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.tidString()),
			status: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<
					| 'deactivated'
					| 'deleted'
					| 'desynchronized'
					| 'suspended'
					| 'takendown'
					| 'throttled'
					| (string & {})
				>(),
			),
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
		'com.atproto.sync.getRepoStatus': mainSchema;
	}
}
