import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.repo.putRecord', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			repo: /*#__PURE__*/ v.actorIdentifierString(),
			collection: /*#__PURE__*/ v.nsidString(),
			rkey: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.recordKeyString(), [
				/*#__PURE__*/ v.stringLength(0, 512),
			]),
			validate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			record: /*#__PURE__*/ v.unknown(),
			swapRecord: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nullable(/*#__PURE__*/ v.string())),
			swapCommit: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			uri: /*#__PURE__*/ v.resourceUriString(),
			cid: /*#__PURE__*/ v.string(),
			get commit() {
				return /*#__PURE__*/ v.optional(ComAtprotoRepoDefs.commitMetaSchema);
			},
			validationStatus: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<'valid' | 'unknown' | (string & {})>(),
			),
		}),
	},
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.repo.putRecord': mainSchema.$schema;
	}
}
