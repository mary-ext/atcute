import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.identity.signPlcOperation', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			token: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			rotationKeys: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			alsoKnownAs: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			verificationMethods: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			services: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			operation: /*#__PURE__*/ v.unknown(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.identity.signPlcOperation': main$schema;
	}
}
