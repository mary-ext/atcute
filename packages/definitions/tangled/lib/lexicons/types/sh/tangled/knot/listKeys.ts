import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.knot.listKeys', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Pagination cursor
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of keys to return
		 * @minimum 1
		 * @maximum 1000
		 * @default 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			100,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Pagination cursor for next page
			 */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get keys() {
				return /*#__PURE__*/ v.array(publicKeySchema);
			},
		}),
	},
});
const _publicKeySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.knot.listKeys#publicKey')),
	/**
	 * Key upload timestamp
	 */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/**
	 * DID associated with the public key
	 */
	did: /*#__PURE__*/ v.didString(),
	/**
	 * Public key contents
	 * @maxLength 4096
	 */
	key: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
});

type main$schematype = typeof _mainSchema;
type publicKey$schematype = typeof _publicKeySchema;

export interface mainSchema extends main$schematype {}
export interface publicKeySchema extends publicKey$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const publicKeySchema = _publicKeySchema as publicKeySchema;

export interface PublicKey extends v.InferInput<typeof publicKeySchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.knot.listKeys': mainSchema;
	}
}
