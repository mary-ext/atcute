import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('blog.pckt.domain.getStatus', {
	params: /*#__PURE__*/ v.object({
		/** AT-URI of the publication record. Authority MUST match the caller's DID. */
		blog: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** SSL provisioning state (null when no domain configured). */
			sslStatus: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Custom hostname status (null when no domain configured). */
			status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'blog.pckt.domain.getStatus': mainSchema;
	}
}
