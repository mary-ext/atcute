import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _contactSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.describeServer#contact')),
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _linksSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.describeServer#links')),
	privacyPolicy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	termsOfService: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
});
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

type contact$schematype = typeof _contactSchema;
type links$schematype = typeof _linksSchema;
type main$schematype = typeof _mainSchema;

export interface contactSchema extends contact$schematype {}
export interface linksSchema extends links$schematype {}
export interface mainSchema extends main$schematype {}

export const contactSchema = _contactSchema as contactSchema;
export const linksSchema = _linksSchema as linksSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Contact extends v.InferInput<typeof contactSchema> {}
export interface Links extends v.InferInput<typeof linksSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.describeServer': mainSchema;
	}
}
