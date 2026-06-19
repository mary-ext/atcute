import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('blog.pckt.domain.set', {
	params: /*#__PURE__*/ v.object({
		/** AT-URI of the publication record (site.standard.publication). Authority MUST match the caller's DID. */
		blog: /*#__PURE__*/ v.resourceUriString(),
	}),
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Fully-qualified domain name (lowercase).
			 *
			 * @maxLength 253
			 */
			domain: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 253)]),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Cloudflare ownership-verification token to install as a TXT record at _cf-custom-hostname.<domain>.
			 * Required for apex domains not already proxied through Cloudflare; absent when Cloudflare validates
			 * the hostname directly.
			 */
			cfHostnameVerificationToken: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			domain: /*#__PURE__*/ v.string(),
			/** Token to install as a TXT record at _pckt-verify.<domain>. */
			verificationToken: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			verified: /*#__PURE__*/ v.boolean(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'blog.pckt.domain.set': mainSchema;
	}
}
