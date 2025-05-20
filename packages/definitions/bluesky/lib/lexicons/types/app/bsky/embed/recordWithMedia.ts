import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyEmbedExternal from './external.js';
import * as AppBskyEmbedImages from './images.js';
import * as AppBskyEmbedRecord from './record.js';
import * as AppBskyEmbedVideo from './video.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.recordWithMedia')),
	get media() {
		return /*#__PURE__*/ v.variant([
			AppBskyEmbedExternal.mainSchema,
			AppBskyEmbedImages.mainSchema,
			AppBskyEmbedVideo.mainSchema,
		]);
	},
	get record() {
		return AppBskyEmbedRecord.mainSchema;
	},
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.recordWithMedia#view')),
	get media() {
		return /*#__PURE__*/ v.variant([
			AppBskyEmbedExternal.viewSchema,
			AppBskyEmbedImages.viewSchema,
			AppBskyEmbedVideo.viewSchema,
		]);
	},
	get record() {
		return AppBskyEmbedRecord.viewSchema;
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
