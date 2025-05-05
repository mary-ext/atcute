import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoAdminDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.admin.getAccountInfo', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return ComAtprotoAdminDefs.accountViewSchema;
		},
	},
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.admin.getAccountInfo': mainSchema.$schema;
	}
}
