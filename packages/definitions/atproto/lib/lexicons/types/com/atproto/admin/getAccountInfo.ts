import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoAdminDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.admin.getAccountInfo', {
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

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.admin.getAccountInfo': mainSchema;
	}
}
