import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

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
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

const _appPasswordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.server.createAppPassword#appPassword'),
	),
	name: /*#__PURE__*/ v.string(),
	password: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	privileged: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
export const appPasswordSchema = _appPasswordSchema as appPasswordSchema.$schema;
export interface AppPassword extends v.InferInput<typeof appPasswordSchema> {}
export declare namespace appPasswordSchema {
	export {};
	type $schematype = typeof _appPasswordSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.server.createAppPassword': mainSchema.$schema;
	}
}
