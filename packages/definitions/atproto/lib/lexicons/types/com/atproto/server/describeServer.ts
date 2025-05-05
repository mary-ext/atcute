import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.server.describeServer', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			inviteCodeRequired: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			phoneVerificationRequired: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			availableUserDomains: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
			get links() {
				return /*#__PURE__*/ v.optional(linksSchema);
			},
			get contact() {
				return /*#__PURE__*/ v.optional(contactSchema);
			},
			did: /*#__PURE__*/ v.didString(),
		}),
	},
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

const _linksSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.describeServer#links')),
	privacyPolicy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	termsOfService: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
});
export const linksSchema = _linksSchema as linksSchema.$schema;
export interface Links extends v.InferInput<typeof linksSchema> {}
export declare namespace linksSchema {
	export {};
	type $schematype = typeof _linksSchema;
	export interface $schema extends $schematype {}
}

const _contactSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.describeServer#contact')),
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
export const contactSchema = _contactSchema as contactSchema.$schema;
export interface Contact extends v.InferInput<typeof contactSchema> {}
export declare namespace contactSchema {
	export {};
	type $schematype = typeof _contactSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.describeServer': mainSchema.$schema;
	}
}
