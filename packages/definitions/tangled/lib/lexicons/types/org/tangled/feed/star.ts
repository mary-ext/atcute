import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.feed.star'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get subject() {
			return /*#__PURE__*/ v.variant([recordSchema, repoSchema], true);
		},
	}),
);
const _recordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.feed.star#record')),
	get record() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
});
const _repoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.feed.star#repo')),
	identity: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;
type record$schematype = typeof _recordSchema;
type repo$schematype = typeof _repoSchema;

export interface mainSchema extends main$schematype {}
export interface recordSchema extends record$schematype {}
export interface repoSchema extends repo$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const recordSchema = _recordSchema as recordSchema;
export const repoSchema = _repoSchema as repoSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Record extends v.InferInput<typeof recordSchema> {}
export interface Repo extends v.InferInput<typeof repoSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.feed.star': mainSchema;
	}
}
