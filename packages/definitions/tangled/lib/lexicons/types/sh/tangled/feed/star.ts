import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.feed.star'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get subject() {
			return /*#__PURE__*/ v.variant([repoSchema, stringSchema], true);
		},
	}),
);
const _repoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.feed.star#repo')),
	did: /*#__PURE__*/ v.didString(),
});
const _stringSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.feed.star#string')),
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type repo$schematype = typeof _repoSchema;
type string$schematype = typeof _stringSchema;

export interface mainSchema extends main$schematype {}
export interface repoSchema extends repo$schematype {}
export interface stringSchema extends string$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const repoSchema = _repoSchema as repoSchema;
export const stringSchema = _stringSchema as stringSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Repo extends v.InferInput<typeof repoSchema> {}
export interface String extends v.InferInput<typeof stringSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.feed.star': mainSchema;
	}
}
