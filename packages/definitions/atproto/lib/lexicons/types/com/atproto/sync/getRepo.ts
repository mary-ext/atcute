import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.getRepo', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The DID of the repo.
		 */
		did: /*#__PURE__*/ v.didString(),
		/**
		 * The revision ('rev') of the repo to create a diff from.
		 */
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.tidString()),
	}),
	output: {
		type: 'blob',
		encoding: ['application/vnd.ipld.car'],
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.getRepo': mainSchema;
	}
}
