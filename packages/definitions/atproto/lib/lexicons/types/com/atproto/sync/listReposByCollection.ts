import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.listReposByCollection', {
	params: /*#__PURE__*/ v.object({
		collection: /*#__PURE__*/ v.nsidString(),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum size of response set. Recommend setting a large maximum (1000+) when enumerating large DID lists.
		 * @minimum 1
		 * @maximum 2000
		 * @default 500
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 2000)]),
			500,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get repos() {
				return /*#__PURE__*/ v.array(repoSchema);
			},
		}),
	},
});
const _repoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.listReposByCollection#repo')),
	did: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;
type repo$schematype = typeof _repoSchema;

export interface mainSchema extends main$schematype {}
export interface repoSchema extends repo$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const repoSchema = _repoSchema as repoSchema;

export interface Repo extends v.InferInput<typeof repoSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.listReposByCollection': mainSchema;
	}
}
