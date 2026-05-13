import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _blobMetadataSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.whtwnd.blog.defs#blobMetadata')),
	blobref: /*#__PURE__*/ v.blob(),
	name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _blogEntrySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.whtwnd.blog.defs#blogEntry')),
	/** @maxLength 100000 */
	content: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100000)]),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _commentSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.whtwnd.blog.defs#comment')),
	/** @maxLength 1000 */
	content: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1000)]),
	entryUri: /*#__PURE__*/ v.resourceUriString(),
});
const _ogpSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.whtwnd.blog.defs#ogp')),
	height: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	url: /*#__PURE__*/ v.genericUriString(),
	width: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});

type blobMetadata$schematype = typeof _blobMetadataSchema;
type blogEntry$schematype = typeof _blogEntrySchema;
type comment$schematype = typeof _commentSchema;
type ogp$schematype = typeof _ogpSchema;

export interface blobMetadataSchema extends blobMetadata$schematype {}
export interface blogEntrySchema extends blogEntry$schematype {}
export interface commentSchema extends comment$schematype {}
export interface ogpSchema extends ogp$schematype {}

export const blobMetadataSchema = _blobMetadataSchema as blobMetadataSchema;
export const blogEntrySchema = _blogEntrySchema as blogEntrySchema;
export const commentSchema = _commentSchema as commentSchema;
export const ogpSchema = _ogpSchema as ogpSchema;

export interface BlobMetadata extends v.InferInput<typeof blobMetadataSchema> {}
export interface BlogEntry extends v.InferInput<typeof blogEntrySchema> {}
export interface Comment extends v.InferInput<typeof commentSchema> {}
export interface Ogp extends v.InferInput<typeof ogpSchema> {}
