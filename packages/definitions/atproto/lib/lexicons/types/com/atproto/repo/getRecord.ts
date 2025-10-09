import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.repo.getRecord', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The CID of the version of the record. If not specified, then return the most recent version.
		 */
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		/**
		 * The NSID of the record collection.
		 */
		collection: /*#__PURE__*/ v.nsidString(),
		/**
		 * The handle or DID of the repo.
		 */
		repo: /*#__PURE__*/ v.actorIdentifierString(),
		/**
		 * The Record Key.
		 */
		rkey: /*#__PURE__*/ v.recordKeyString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			uri: /*#__PURE__*/ v.resourceUriString(),
			value: /*#__PURE__*/ v.unknown(),
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
		'com.atproto.repo.getRecord': mainSchema;
	}
}
