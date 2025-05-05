import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.server.requestEmailUpdate', {
	params: null,
	input: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			tokenRequired: /*#__PURE__*/ v.boolean(),
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
		'com.atproto.server.requestEmailUpdate': mainSchema.$schema;
	}
}
