import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _aspectRatioSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#aspectRatio')),
	/** @minimum 1 */
	height: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/** @minimum 1 */
	width: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});
const _byteSliceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#byteSlice')),
	/** @minimum 0 */
	byteEnd: /*#__PURE__*/ v.integer(),
	/** @minimum 0 */
	byteStart: /*#__PURE__*/ v.integer(),
});
const _externalSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#external')),
	description: /*#__PURE__*/ v.string(),
	/**
	 * @accept image/*
	 * @maxSize 1000000
	 */
	thumb: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
			/*#__PURE__*/ v.blobSize(1000000),
			/*#__PURE__*/ v.blobAccept(['image/*']),
		]),
	),
	title: /*#__PURE__*/ v.string(),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _facetSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#facet')),
	get features() {
		return /*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([linkSchema, mentionSchema, tagSchema]));
	},
	get index() {
		return byteSliceSchema;
	},
});
const _imageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#image')),
	alt: /*#__PURE__*/ v.string(),
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(aspectRatioSchema);
	},
	/**
	 * @accept image/*
	 * @maxSize 1000000
	 */
	image: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
		/*#__PURE__*/ v.blobSize(1000000),
		/*#__PURE__*/ v.blobAccept(['image/*']),
	]),
});
const _imagesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#images')),
	/** @maxLength 4 */
	get images() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(imageSchema), [/*#__PURE__*/ v.arrayLength(0, 4)]);
	},
});
const _linkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#link')),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('blog.pckt.mini.post'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get embed() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.variant([externalSchema, imagesSchema, recordSchema, recordWithMediaSchema]),
			);
		},
		get facets() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(facetSchema));
		},
		get labels() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]));
		},
		/** @maxLength 3 */
		langs: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.languageCodeString()), [
				/*#__PURE__*/ v.arrayLength(0, 3),
			]),
		),
		publication: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		get reply() {
			return /*#__PURE__*/ v.optional(replyRefSchema);
		},
		subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		/** @maxLength 8 */
		tags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
						/*#__PURE__*/ v.stringLength(0, 640),
						/*#__PURE__*/ v.stringGraphemes(0, 64),
					]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 8)],
			),
		),
		/**
		 * @maxLength 3000
		 * @maxGraphemes 300
		 */
		text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	}),
);
const _mentionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#mention')),
	did: /*#__PURE__*/ v.didString(),
});
const _recordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#record')),
	/**
	 * Character offset one past the end of the quoted passage.
	 *
	 * @minimum 0
	 */
	end: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * sha256 of the quoted passage's text, with whitespace collapsed.
	 *
	 * @maxLength 64
	 */
	hash: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 64)]),
	),
	get record() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
	/**
	 * Character offset of the quoted passage in the quoted record's plain text.
	 *
	 * @minimum 0
	 */
	start: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _recordWithMediaSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#recordWithMedia')),
	get media() {
		return /*#__PURE__*/ v.variant([externalSchema, imagesSchema]);
	},
	get record() {
		return recordSchema;
	},
});
const _replyRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#replyRef')),
	get parent() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
	get root() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
});
const _tagSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.mini.post#tag')),
	/**
	 * @maxLength 640
	 * @maxGraphemes 64
	 */
	tag: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 640),
		/*#__PURE__*/ v.stringGraphemes(0, 64),
	]),
});

type aspectRatio$schematype = typeof _aspectRatioSchema;
type byteSlice$schematype = typeof _byteSliceSchema;
type external$schematype = typeof _externalSchema;
type facet$schematype = typeof _facetSchema;
type image$schematype = typeof _imageSchema;
type images$schematype = typeof _imagesSchema;
type link$schematype = typeof _linkSchema;
type main$schematype = typeof _mainSchema;
type mention$schematype = typeof _mentionSchema;
type record$schematype = typeof _recordSchema;
type recordWithMedia$schematype = typeof _recordWithMediaSchema;
type replyRef$schematype = typeof _replyRefSchema;
type tag$schematype = typeof _tagSchema;

export interface aspectRatioSchema extends aspectRatio$schematype {}
export interface byteSliceSchema extends byteSlice$schematype {}
export interface externalSchema extends external$schematype {}
export interface facetSchema extends facet$schematype {}
export interface imageSchema extends image$schematype {}
export interface imagesSchema extends images$schematype {}
export interface linkSchema extends link$schematype {}
export interface mainSchema extends main$schematype {}
export interface mentionSchema extends mention$schematype {}
export interface recordSchema extends record$schematype {}
export interface recordWithMediaSchema extends recordWithMedia$schematype {}
export interface replyRefSchema extends replyRef$schematype {}
export interface tagSchema extends tag$schematype {}

export const aspectRatioSchema = _aspectRatioSchema as aspectRatioSchema;
export const byteSliceSchema = _byteSliceSchema as byteSliceSchema;
export const externalSchema = _externalSchema as externalSchema;
export const facetSchema = _facetSchema as facetSchema;
export const imageSchema = _imageSchema as imageSchema;
export const imagesSchema = _imagesSchema as imagesSchema;
export const linkSchema = _linkSchema as linkSchema;
export const mainSchema = _mainSchema as mainSchema;
export const mentionSchema = _mentionSchema as mentionSchema;
export const recordSchema = _recordSchema as recordSchema;
export const recordWithMediaSchema = _recordWithMediaSchema as recordWithMediaSchema;
export const replyRefSchema = _replyRefSchema as replyRefSchema;
export const tagSchema = _tagSchema as tagSchema;

export interface AspectRatio extends v.InferInput<typeof aspectRatioSchema> {}
export interface ByteSlice extends v.InferInput<typeof byteSliceSchema> {}
export interface External extends v.InferInput<typeof externalSchema> {}
export interface Facet extends v.InferInput<typeof facetSchema> {}
export interface Image extends v.InferInput<typeof imageSchema> {}
export interface Images extends v.InferInput<typeof imagesSchema> {}
export interface Link extends v.InferInput<typeof linkSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Mention extends v.InferInput<typeof mentionSchema> {}
export interface Record extends v.InferInput<typeof recordSchema> {}
export interface RecordWithMedia extends v.InferInput<typeof recordWithMediaSchema> {}
export interface ReplyRef extends v.InferInput<typeof replyRefSchema> {}
export interface Tag extends v.InferInput<typeof tagSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'blog.pckt.mini.post': mainSchema;
	}
}
