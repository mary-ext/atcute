import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.sync.listRepos', {
	params: /*#__PURE__*/ v.object({
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			500,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
	did: /*#__PURE__*/ v.didString(),
	head: /*#__PURE__*/ v.string(),
	rev: /*#__PURE__*/ v.tidString(),
	active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	status: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			'takendown' | 'suspended' | 'deleted' | 'deactivated' | 'desynchronized' | 'throttled' | (string & {})
		>(),
	),
});

type main$schematype = typeof _mainSchema;
type repo$schematype = typeof _repoSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}
/** @deprecated */
export interface repo$schema extends repo$schematype {}

export const mainSchema = _mainSchema as main$schema;
export const repoSchema = _repoSchema as repo$schema;

export interface Repo extends v.InferInput<typeof repoSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.listRepos': main$schema;
	}
}
