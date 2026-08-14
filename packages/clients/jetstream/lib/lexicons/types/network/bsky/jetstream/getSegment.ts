import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('network.bsky.jetstream.getSegment', {
	params: /*#__PURE__*/ v.object({
		/** The segment filename, e.g. seg_000000002a.jss */
		name: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'blob',
		encoding: ['application/octet-stream'],
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'network.bsky.jetstream.getSegment': mainSchema;
	}
}
