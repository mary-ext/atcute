import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.repo.deleteRecord', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			repo: /*#__PURE__*/ v.actorIdentifierString(),
			collection: /*#__PURE__*/ v.nsidString(),
			rkey: /*#__PURE__*/ v.recordKeyString(),
			swapRecord: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			swapCommit: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.repo.deleteRecord': main$schema;
	}
}
