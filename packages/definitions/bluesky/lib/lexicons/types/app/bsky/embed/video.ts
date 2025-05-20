import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyEmbedDefs from './defs.js';

const _captionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.video#caption')),
	file: /*#__PURE__*/ v.blob(),
	lang: /*#__PURE__*/ v.languageCodeString(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.video')),
	alt: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 10000),
			/*#__PURE__*/ v.stringGraphemes(0, 1000),
		]),
	),
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(AppBskyEmbedDefs.aspectRatioSchema);
	},
	get captions() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(captionSchema), [/*#__PURE__*/ v.arrayLength(0, 20)]),
		);
	},
	video: /*#__PURE__*/ v.blob(),
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.video#view')),
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
