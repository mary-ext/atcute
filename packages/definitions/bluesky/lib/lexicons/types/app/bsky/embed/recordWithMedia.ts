import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyEmbedExternal from './external.js';
import * as AppBskyEmbedImages from './images.js';
import * as AppBskyEmbedRecord from './record.js';
import * as AppBskyEmbedVideo from './video.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.recordWithMedia')),
	get record() {
		return AppBskyEmbedRecord.mainSchema;
	},
	get media() {
		return /*#__PURE__*/ v.variant([
			AppBskyEmbedImages.mainSchema,
			AppBskyEmbedVideo.mainSchema,
			AppBskyEmbedExternal.mainSchema,
		]);
	},
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.recordWithMedia#view')),
	get record() {
		return AppBskyEmbedRecord.viewSchema;
	},
	get media() {
		return /*#__PURE__*/ v.variant([
			AppBskyEmbedImages.viewSchema,
			AppBskyEmbedVideo.viewSchema,
			AppBskyEmbedExternal.viewSchema,
		]);
	},
});

type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;

export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
