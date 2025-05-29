import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _appPasswordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.listAppPasswords#appPassword')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	name: /*#__PURE__*/ v.string(),
	privileged: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _mainSchema = /*#__PURE__*/ v.query('com.atproto.server.listAppPasswords', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get passwords() {
				return /*#__PURE__*/ v.array(appPasswordSchema);
			},
		}),
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
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.listAppPasswords': mainSchema;
	}
}
