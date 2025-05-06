import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.admin.sendEmail', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			recipientDid: /*#__PURE__*/ v.didString(),
			content: /*#__PURE__*/ v.string(),
			subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			senderDid: /*#__PURE__*/ v.didString(),
			comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			sent: /*#__PURE__*/ v.boolean(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.admin.sendEmail': mainSchema;
	}
}
