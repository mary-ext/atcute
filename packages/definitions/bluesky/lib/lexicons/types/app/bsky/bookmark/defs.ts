import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyFeedDefs from '../feed/defs.js';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';

const _bookmarkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.bookmark.defs#bookmark')),
	/**
	 * A strong ref to the record to be bookmarked. Currently, only `app.bsky.feed.post` records are supported.
	 */
	get subject() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
});
const _bookmarkViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.bookmark.defs#bookmarkView')),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get item() {
		return /*#__PURE__*/ v.variant([
			AppBskyFeedDefs.blockedPostSchema,
			AppBskyFeedDefs.notFoundPostSchema,
			AppBskyFeedDefs.postViewSchema,
		]);
	},
	/**
	 * A strong ref to the bookmarked record.
	 */
	get subject() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
});

type bookmark$schematype = typeof _bookmarkSchema;
type bookmarkView$schematype = typeof _bookmarkViewSchema;

export interface bookmarkSchema extends bookmark$schematype {}
export interface bookmarkViewSchema extends bookmarkView$schematype {}

export const bookmarkSchema = _bookmarkSchema as bookmarkSchema;
export const bookmarkViewSchema = _bookmarkViewSchema as bookmarkViewSchema;

export interface Bookmark extends v.InferInput<typeof bookmarkSchema> {}
export interface BookmarkView extends v.InferInput<typeof bookmarkViewSchema> {}
