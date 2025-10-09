import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.listBlobs', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * The DID of the repo.
		 */
		did: /*#__PURE__*/ v.didString(),
		/**
		 * @minimum 1
		 * @maximum 1000
		 * @default 500
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			500,
		),
		/**
		 * Optional revision of the repo to list blobs since.
		 */
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.tidString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.cidString()),
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'com.atproto.sync.listBlobs': mainSchema;
	}
}
