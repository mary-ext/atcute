import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.repo.describeRepo', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The handle or DID of the repo.
		 */
		repo: /*#__PURE__*/ v.actorIdentifierString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * List of all the collections (NSIDs) for which this repo contains at least one record.
			 */
			collections: /*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()),
			did: /*#__PURE__*/ v.didString(),
			/**
			 * The complete DID document for this account.
			 */
			didDoc: /*#__PURE__*/ v.unknown(),
			handle: /*#__PURE__*/ v.handleString(),
			/**
			 * Indicates if handle is currently valid (resolves bi-directionally)
			 */
			handleIsCorrect: /*#__PURE__*/ v.boolean(),
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
		'com.atproto.repo.describeRepo': mainSchema;
	}
}
