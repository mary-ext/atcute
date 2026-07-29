import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.notification.markAllRead', {
	params: null,
	input: null,
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.notification.markAllRead': mainSchema;
	}
}
