import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.server.deactivateAccount', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			deleteAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.deactivateAccount': mainSchema;
	}
}
