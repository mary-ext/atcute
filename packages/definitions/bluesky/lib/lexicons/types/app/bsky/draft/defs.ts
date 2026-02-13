import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyFeedPostgate from '../feed/postgate.ts';
import * as AppBskyFeedThreadgate from '../feed/threadgate.ts';

const _draftSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draft')),
	/**
	 * UUIDv4 identifier of the device that created this draft.
	 * @maxLength 100
	 */
	deviceId: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	),
	/**
	 * The device and/or platform on which the draft was created.
	 * @maxLength 100
	 */
	deviceName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	),
	/**
	 * Indicates human language of posts primary text content.
	 * @maxLength 3
	 */
	langs: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.languageCodeString()), [
			/*#__PURE__*/ v.arrayLength(0, 3),
		]),
	),
	/**
	 * Embedding rules for the postgates to be created when this draft is published.
	 * @maxLength 5
	 */
	get postgateEmbeddingRules() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([AppBskyFeedPostgate.disableRuleSchema])),
				[/*#__PURE__*/ v.arrayLength(0, 5)],
			),
		);
	},
	/**
	 * Array of draft posts that compose this draft.
	 * @minLength 1
	 * @maxLength 100
	 */
	get posts() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(draftPostSchema), [
			/*#__PURE__*/ v.arrayLength(1, 100),
		]);
	},
	/**
	 * Allow-rules for the threadgate to be created when this draft is published.
	 * @maxLength 5
	 */
	get threadgateAllow() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						AppBskyFeedThreadgate.followerRuleSchema,
						AppBskyFeedThreadgate.followingRuleSchema,
						AppBskyFeedThreadgate.listRuleSchema,
						AppBskyFeedThreadgate.mentionRuleSchema,
					]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 5)],
			),
		);
	},
});
const _draftEmbedCaptionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draftEmbedCaption')),
	/**
	 * @maxLength 10000
	 */
	content: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 10000)]),
	lang: /*#__PURE__*/ v.languageCodeString(),
});
const _draftEmbedExternalSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draftEmbedExternal')),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _draftEmbedImageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draftEmbedImage')),
	/**
	 * @maxGraphemes 2000
	 */
	alt: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(0, 2000)]),
	),
	get localRef() {
		return draftEmbedLocalRefSchema;
	},
});
const _draftEmbedLocalRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draftEmbedLocalRef')),
	/**
	 * Local, on-device ref to file to be embedded. Embeds are currently device-bound for drafts.
	 * @minLength 1
	 * @maxLength 1024
	 */
	path: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 1024)]),
});
const _draftEmbedRecordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draftEmbedRecord')),
	get record() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
});
const _draftEmbedVideoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draftEmbedVideo')),
	/**
	 * @maxGraphemes 2000
	 */
	alt: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(0, 2000)]),
	),
	/**
	 * @maxLength 20
	 */
	get captions() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(draftEmbedCaptionSchema), [
				/*#__PURE__*/ v.arrayLength(0, 20),
			]),
		);
	},
	get localRef() {
		return draftEmbedLocalRefSchema;
	},
});
const _draftPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draftPost')),
	/**
	 * @maxLength 1
	 */
	get embedExternals() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(draftEmbedExternalSchema), [
				/*#__PURE__*/ v.arrayLength(0, 1),
			]),
		);
	},
	/**
	 * @maxLength 4
	 */
	get embedImages() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(draftEmbedImageSchema), [
				/*#__PURE__*/ v.arrayLength(0, 4),
			]),
		);
	},
	/**
	 * @maxLength 1
	 */
	get embedRecords() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(draftEmbedRecordSchema), [
				/*#__PURE__*/ v.arrayLength(0, 1),
			]),
		);
	},
	/**
	 * @maxLength 1
	 */
	get embedVideos() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(draftEmbedVideoSchema), [
				/*#__PURE__*/ v.arrayLength(0, 1),
			]),
		);
	},
	/**
	 * Self-label values for this post. Effectively content warnings.
	 */
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]));
	},
	/**
	 * The primary post content. It has a higher limit than post contents to allow storing a larger text that can later be refined into smaller posts.
	 * @maxLength 10000
	 * @maxGraphemes 1000
	 */
	text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 10000),
		/*#__PURE__*/ v.stringGraphemes(0, 1000),
	]),
});
const _draftViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draftView')),
	/**
	 * The time the draft was created.
	 */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get draft() {
		return draftSchema;
	},
	/**
	 * A TID to be used as a draft identifier.
	 */
	id: /*#__PURE__*/ v.tidString(),
	/**
	 * The time the draft was last updated.
	 */
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});
const _draftWithIdSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.draft.defs#draftWithId')),
	get draft() {
		return draftSchema;
	},
	/**
	 * A TID to be used as a draft identifier.
	 */
	id: /*#__PURE__*/ v.tidString(),
});

type draft$schematype = typeof _draftSchema;
type draftEmbedCaption$schematype = typeof _draftEmbedCaptionSchema;
type draftEmbedExternal$schematype = typeof _draftEmbedExternalSchema;
type draftEmbedImage$schematype = typeof _draftEmbedImageSchema;
type draftEmbedLocalRef$schematype = typeof _draftEmbedLocalRefSchema;
type draftEmbedRecord$schematype = typeof _draftEmbedRecordSchema;
type draftEmbedVideo$schematype = typeof _draftEmbedVideoSchema;
type draftPost$schematype = typeof _draftPostSchema;
type draftView$schematype = typeof _draftViewSchema;
type draftWithId$schematype = typeof _draftWithIdSchema;

export interface draftSchema extends draft$schematype {}
export interface draftEmbedCaptionSchema extends draftEmbedCaption$schematype {}
export interface draftEmbedExternalSchema extends draftEmbedExternal$schematype {}
export interface draftEmbedImageSchema extends draftEmbedImage$schematype {}
export interface draftEmbedLocalRefSchema extends draftEmbedLocalRef$schematype {}
export interface draftEmbedRecordSchema extends draftEmbedRecord$schematype {}
export interface draftEmbedVideoSchema extends draftEmbedVideo$schematype {}
export interface draftPostSchema extends draftPost$schematype {}
export interface draftViewSchema extends draftView$schematype {}
export interface draftWithIdSchema extends draftWithId$schematype {}

export const draftSchema = _draftSchema as draftSchema;
export const draftEmbedCaptionSchema = _draftEmbedCaptionSchema as draftEmbedCaptionSchema;
export const draftEmbedExternalSchema = _draftEmbedExternalSchema as draftEmbedExternalSchema;
export const draftEmbedImageSchema = _draftEmbedImageSchema as draftEmbedImageSchema;
export const draftEmbedLocalRefSchema = _draftEmbedLocalRefSchema as draftEmbedLocalRefSchema;
export const draftEmbedRecordSchema = _draftEmbedRecordSchema as draftEmbedRecordSchema;
export const draftEmbedVideoSchema = _draftEmbedVideoSchema as draftEmbedVideoSchema;
export const draftPostSchema = _draftPostSchema as draftPostSchema;
export const draftViewSchema = _draftViewSchema as draftViewSchema;
export const draftWithIdSchema = _draftWithIdSchema as draftWithIdSchema;

export interface Draft extends v.InferInput<typeof draftSchema> {}
export interface DraftEmbedCaption extends v.InferInput<typeof draftEmbedCaptionSchema> {}
export interface DraftEmbedExternal extends v.InferInput<typeof draftEmbedExternalSchema> {}
export interface DraftEmbedImage extends v.InferInput<typeof draftEmbedImageSchema> {}
export interface DraftEmbedLocalRef extends v.InferInput<typeof draftEmbedLocalRefSchema> {}
export interface DraftEmbedRecord extends v.InferInput<typeof draftEmbedRecordSchema> {}
export interface DraftEmbedVideo extends v.InferInput<typeof draftEmbedVideoSchema> {}
export interface DraftPost extends v.InferInput<typeof draftPostSchema> {}
export interface DraftView extends v.InferInput<typeof draftViewSchema> {}
export interface DraftWithId extends v.InferInput<typeof draftWithIdSchema> {}
