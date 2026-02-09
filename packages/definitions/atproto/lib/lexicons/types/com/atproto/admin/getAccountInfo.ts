import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ComAtprotoAdminDefs from './defs.ts';

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

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.admin.getAccountInfo': mainSchema;
	}
}
