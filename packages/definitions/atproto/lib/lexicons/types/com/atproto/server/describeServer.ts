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
const _linksSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.describeServer#links')),
	privacyPolicy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	termsOfService: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
});
const _contactSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.server.describeServer#contact')),
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type main$schematype = typeof _mainSchema;
type links$schematype = typeof _linksSchema;
type contact$schematype = typeof _contactSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}
/** @deprecated */
export interface links$schema extends links$schematype {}
/** @deprecated */
export interface contact$schema extends contact$schematype {}

export const mainSchema = _mainSchema as main$schema;
export const linksSchema = _linksSchema as links$schema;
export const contactSchema = _contactSchema as contact$schema;

export interface Links extends v.InferInput<typeof linksSchema> {}
export interface Contact extends v.InferInput<typeof contactSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.describeServer': main$schema;
	}
}
