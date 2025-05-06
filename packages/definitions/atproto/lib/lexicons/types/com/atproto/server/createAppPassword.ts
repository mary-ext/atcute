import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _appPasswordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.server.createAppPassword#appPassword'),
	),
	name: /*#__PURE__*/ v.string(),
	password: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	privileged: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.server.createAppPassword', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			name: /*#__PURE__*/ v.string(),
			privileged: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return appPasswordSchema;
		},
	},
});

type appPassword$schematype = typeof _appPasswordSchema;
type main$schematype = typeof _mainSchema;

export interface appPasswordSchema extends appPassword$schematype {}
export interface mainSchema extends main$schematype {}

export const appPasswordSchema = _appPasswordSchema as appPasswordSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface AppPassword extends v.InferInput<typeof appPasswordSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.createAppPassword': mainSchema;
	}
}
