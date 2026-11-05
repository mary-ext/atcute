import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _contactSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.spindle.describeSpindle#contact')),
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _linksSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.spindle.describeSpindle#links')),
	privacyPolicy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	termsOfService: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.spindle.describeSpindle', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Protocol capability tokens this spindle implements. Spindle that omit this field are treated as
			 * legacy.
			 */
			capabilities: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.string<'tangled1.0' | (string & {})>()),
			),
			/** Contact information */
			get contact() {
				return /*#__PURE__*/ v.optional(contactSchema);
			},
			did: /*#__PURE__*/ v.didString(),
			/** URLs of service policy documents. */
			get links() {
				return /*#__PURE__*/ v.optional(linksSchema);
			},
			version: /*#__PURE__*/ v.string(),
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

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.spindle.describeSpindle': mainSchema;
	}
}
