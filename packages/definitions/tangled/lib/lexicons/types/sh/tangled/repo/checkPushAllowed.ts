import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.checkPushAllowed', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Public key in OpenSSH authorized_keys format.
		 *
		 * @maxLength 4096
		 */
		key: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
		/** A repo DID. */
		repo: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Whether the key's owner may push to the repo. */
			allowed: /*#__PURE__*/ v.boolean(),
			/** DID the key resolved to, if a match was found. */
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
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
		'sh.tangled.repo.checkPushAllowed': mainSchema;
	}
}
