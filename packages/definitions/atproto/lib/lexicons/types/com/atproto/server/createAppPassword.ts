import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _appPasswordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.server.createAppPassword#appPassword'),
	),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	name: /*#__PURE__*/ v.string(),
	password: /*#__PURE__*/ v.string(),
	privileged: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.server.createAppPassword', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * A short name for the App Password, to help distinguish them.
			 */
			name: /*#__PURE__*/ v.string(),
			/**
			 * If an app password has 'privileged' access to possibly sensitive account state. Meant for use with trusted clients.
			 */
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

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.createAppPassword': mainSchema;
	}
}
