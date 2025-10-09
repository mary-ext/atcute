import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.listRepos', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 1000
		 * @default 500
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
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
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.listRepos#repo')),
	active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	did: /*#__PURE__*/ v.didString(),
	/**
	 * Current repo commit CID
	 */
	head: /*#__PURE__*/ v.cidString(),
	rev: /*#__PURE__*/ v.tidString(),
	/**
	 * If active=false, this optional field indicates a possible reason for why the account is not active. If active=false and no status is supplied, then the host makes no claim for why the repository is no longer being hosted.
	 */
	status: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			'deactivated' | 'deleted' | 'desynchronized' | 'suspended' | 'takendown' | 'throttled' | (string & {})
		>(),
	),
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
		'com.atproto.sync.listRepos': mainSchema;
	}
}
