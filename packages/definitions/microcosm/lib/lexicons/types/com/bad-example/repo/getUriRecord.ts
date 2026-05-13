import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('com.bad-example.repo.getUriRecord', {
	params: /*#__PURE__*/ v.object({
		/** the at-uri of the record (identifier can be a DID or handle) */
		at_uri: /*#__PURE__*/ v.resourceUriString(),
		/**
		 * optional CID of the version of the record. if not specified, return the most recent version. if
		 * specified and a newer version exists, returns 404.
		 */
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** CID for this exact version of the record */
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			/** at-uri for this record */
			uri: /*#__PURE__*/ v.resourceUriString(),
			/** the record itself */
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
		'com.bad-example.repo.getUriRecord': mainSchema;
	}
}
