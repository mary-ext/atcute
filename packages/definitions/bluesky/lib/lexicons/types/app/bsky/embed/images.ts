import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyEmbedDefs from './defs.js';

const _imageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.images#image')),
	image: /*#__PURE__*/ v.blob(),
	alt: /*#__PURE__*/ v.string(),
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(AppBskyEmbedDefs.aspectRatioSchema);
	},
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.images')),
	get images() {
		return /*#__PURE__*/ v.constrain(v.array(imageSchema), [/*#__PURE__*/ v.arrayLength(0, 4)]);
	},
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.images#view')),
	get images() {
		return /*#__PURE__*/ v.constrain(v.array(viewImageSchema), [/*#__PURE__*/ v.arrayLength(0, 4)]);
	},
});
const _viewImageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.images#viewImage')),
	thumb: /*#__PURE__*/ v.genericUriString(),
	fullsize: /*#__PURE__*/ v.genericUriString(),
	alt: /*#__PURE__*/ v.string(),
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(AppBskyEmbedDefs.aspectRatioSchema);
	},
});

type image$schematype = typeof _imageSchema;
type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;
type viewImage$schematype = typeof _viewImageSchema;

export interface imageSchema extends image$schematype {}
export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}
export interface viewImageSchema extends viewImage$schematype {}

export const imageSchema = _imageSchema as imageSchema;
export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;
export const viewImageSchema = _viewImageSchema as viewImageSchema;

export interface Image extends v.InferInput<typeof imageSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
export interface ViewImage extends v.InferInput<typeof viewImageSchema> {}
