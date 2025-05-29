import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.repo.importRepo', {
	params: null,
	input: {
		type: 'blob',
		encoding: ['application/vnd.ipld.car'],
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export type $input = v.InferXRPCBodyInput<mainSchema['input']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.repo.importRepo': mainSchema;
	}
}
