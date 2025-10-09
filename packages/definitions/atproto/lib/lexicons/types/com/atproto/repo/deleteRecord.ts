import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.repo.deleteRecord', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The NSID of the record collection.
			 */
			collection: /*#__PURE__*/ v.nsidString(),
			/**
			 * The handle or DID of the repo (aka, current account).
			 */
			repo: /*#__PURE__*/ v.actorIdentifierString(),
			/**
			 * The Record Key.
			 */
			rkey: /*#__PURE__*/ v.recordKeyString(),
			/**
			 * Compare and swap with the previous commit by CID.
			 */
			swapCommit: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			/**
			 * Compare and swap with the previous record by CID.
			 */
			swapRecord: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get commit() {
				return /*#__PURE__*/ v.optional(ComAtprotoRepoDefs.commitMetaSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.repo.deleteRecord': mainSchema;
	}
}
