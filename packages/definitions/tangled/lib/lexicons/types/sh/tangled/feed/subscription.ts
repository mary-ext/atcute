import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.feed.subscription'),
		/**
		 * Optional collection NSIDs to filter which notifications are sent. Empty or absent means all
		 * collections.
		 */
		collections: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get subject() {
			return /*#__PURE__*/ v.variant([repoSchema, uriSchema], true);
		},
	}),
);
const _repoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.feed.subscription#repo')),
	did: /*#__PURE__*/ v.didString(),
});
const _uriSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.feed.subscription#uri')),
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type repo$schematype = typeof _repoSchema;
type uri$schematype = typeof _uriSchema;

export interface mainSchema extends main$schematype {}
export interface repoSchema extends repo$schematype {}
export interface uriSchema extends uri$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const repoSchema = _repoSchema as repoSchema;
export const uriSchema = _uriSchema as uriSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Repo extends v.InferInput<typeof repoSchema> {}
export interface Uri extends v.InferInput<typeof uriSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.feed.subscription': mainSchema;
	}
}
