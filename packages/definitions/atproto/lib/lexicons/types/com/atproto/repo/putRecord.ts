import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.repo.putRecord', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The NSID of the record collection.
			 */
			collection: /*#__PURE__*/ v.nsidString(),
			/**
			 * The record to write.
			 */
			record: /*#__PURE__*/ v.unknown(),
			/**
			 * The handle or DID of the repo (aka, current account).
			 */
			repo: /*#__PURE__*/ v.actorIdentifierString(),
			/**
			 * The Record Key.
			 * @maxLength 512
			 */
			rkey: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.recordKeyString(), [
				/*#__PURE__*/ v.stringLength(0, 512),
			]),
			/**
			 * Compare and swap with the previous commit by CID.
			 */
			swapCommit: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			/**
			 * Compare and swap with the previous record by CID. WARNING: nullable and optional field; may cause problems with golang implementation
			 */
			swapRecord: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nullable(/*#__PURE__*/ v.cidString())),
			/**
			 * Can be set to 'false' to skip Lexicon schema validation of record data, 'true' to require it, or leave unset to validate only for known Lexicons.
			 */
			validate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cid: /*#__PURE__*/ v.cidString(),
			get commit() {
				return /*#__PURE__*/ v.optional(ComAtprotoRepoDefs.commitMetaSchema);
			},
			uri: /*#__PURE__*/ v.resourceUriString(),
			validationStatus: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<'unknown' | 'valid' | (string & {})>(),
			),
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
		'com.atproto.repo.putRecord': mainSchema;
	}
}
