import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.getBlob', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The CID of the blob to fetch
		 */
		cid: /*#__PURE__*/ v.cidString(),
		/**
		 * The DID of the account.
		 */
		did: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'blob',
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.getBlob': mainSchema;
	}
}
