import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _appPasswordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.listAppPasswords#appPassword')),
	name: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	privileged: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.server.listAppPasswords', {
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

/** @deprecated */
export interface appPassword$schema extends appPassword$schematype {}
/** @deprecated */
export interface main$schema extends main$schematype {}

export const appPasswordSchema = _appPasswordSchema as appPassword$schema;
export const mainSchema = _mainSchema as main$schema;

export interface AppPassword extends v.InferInput<typeof appPasswordSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.listAppPasswords': main$schema;
	}
}
