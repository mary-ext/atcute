import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('network.bsky.jetstream.getBlock', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Zero-based block index within the segment. Must be < the segment's block_count.
		 *
		 * @minimum 0
		 */
		blockIndex: /*#__PURE__*/ v.integer(),
		/** The sealed segment filename, e.g. seg_000000002a.jss. */
		segment: /*#__PURE__*/ v.string(),
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
		'network.bsky.jetstream.getBlock': mainSchema;
	}
}
