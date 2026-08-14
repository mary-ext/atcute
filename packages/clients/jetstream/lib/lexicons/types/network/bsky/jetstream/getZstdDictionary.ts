import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('network.bsky.jetstream.getZstdDictionary', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The zstd dictionary ID to fetch. Omitted: the server's current dictionary.
		 *
		 * @minimum 1
		 */
		id: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
		),
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
		'network.bsky.jetstream.getZstdDictionary': mainSchema;
	}
}
