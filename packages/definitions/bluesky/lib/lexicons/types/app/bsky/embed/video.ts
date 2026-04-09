import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyEmbedDefs from './defs.ts';

const _captionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.video#caption')),
	/**
	 * @accept text/vtt
	 * @maxSize 20000
	 */
	file: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
		/*#__PURE__*/ v.blobSize(20000),
		/*#__PURE__*/ v.blobAccept(['text/vtt']),
	]),
	lang: /*#__PURE__*/ v.languageCodeString(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.video')),
	/**
	 * Alt text description of the video, for accessibility.
	 * @maxLength 10000
	 * @maxGraphemes 1000
	 */
	alt: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 10000),
			/*#__PURE__*/ v.stringGraphemes(0, 1000),
		]),
	),
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(AppBskyEmbedDefs.aspectRatioSchema);
	},
	/**
	 * @maxLength 20
	 */
	get captions() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(captionSchema), [/*#__PURE__*/ v.arrayLength(0, 20)]),
		);
	},
	/**
	 * A hint to the client about how to present the video.
	 */
	presentation: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'default' | 'gif' | (string & {})>()),
	/**
	 * The mp4 video file. May be up to 100mb, formerly limited to 50mb.
	 * @accept video/mp4
	 * @maxSize 100000000
	 */
	video: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
		/*#__PURE__*/ v.blobSize(100000000),
		/*#__PURE__*/ v.blobAccept(['video/mp4']),
	]),
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.video#view')),
	/**
	 * @maxLength 10000
	 * @maxGraphemes 1000
	 */
	alt: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 10000),
			/*#__PURE__*/ v.stringGraphemes(0, 1000),
		]),
	),
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(AppBskyEmbedDefs.aspectRatioSchema);
	},
	cid: /*#__PURE__*/ v.cidString(),
	playlist: /*#__PURE__*/ v.genericUriString(),
	/**
	 * A hint to the client about how to present the video.
	 */
	presentation: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'default' | 'gif' | (string & {})>()),
	thumbnail: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
});

type caption$schematype = typeof _captionSchema;
type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;

export interface captionSchema extends caption$schematype {}
export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}

export const captionSchema = _captionSchema as captionSchema;
export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;

export interface Caption extends v.InferInput<typeof captionSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
