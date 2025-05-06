import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.identity.submitPlcOperation', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			operation: /*#__PURE__*/ v.unknown(),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.identity.submitPlcOperation': mainSchema;
	}
}
