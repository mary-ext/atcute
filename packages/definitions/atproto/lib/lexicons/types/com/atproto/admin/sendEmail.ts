import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.admin.sendEmail', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Additional comment by the sender that won't be used in the email itself but helpful to provide more context for moderators/reviewers
			 */
			comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			content: /*#__PURE__*/ v.string(),
			recipientDid: /*#__PURE__*/ v.didString(),
			senderDid: /*#__PURE__*/ v.didString(),
			subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.admin.sendEmail': mainSchema;
	}
}
