import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.repo.uploadBlob', {
	params: null,
	input: {
		type: 'blob',
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			blob: /*#__PURE__*/ v.blob(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.repo.uploadBlob': main$schema;
	}
}
