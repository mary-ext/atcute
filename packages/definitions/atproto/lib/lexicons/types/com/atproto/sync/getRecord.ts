import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.getRecord', {
	params: /*#__PURE__*/ v.object({
		collection: /*#__PURE__*/ v.nsidString(),
		/**
		 * The DID of the repo.
		 */
		did: /*#__PURE__*/ v.didString(),
		/**
		 * Record Key
		 */
		rkey: /*#__PURE__*/ v.recordKeyString(),
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
		'com.atproto.sync.getRecord': mainSchema;
	}
}
