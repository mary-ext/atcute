import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyActorDefs from '../actor/defs.ts';

import * as AppBskyEmbedDefs from './defs.ts';

const _colorRGBSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#colorRGB')),
	/**
	 * @minimum 0
	 * @maximum 255
	 */
	b: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 255)]),
	/**
	 * @minimum 0
	 * @maximum 255
	 */
	g: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 255)]),
	/**
	 * @minimum 0
	 * @maximum 255
	 */
	r: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 255)]),
});
const _externalSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#external')),
	/** StrongRefs (uri+cid) of the Atmosphere records that backed this view. */
	get associatedRefs() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoRepoStrongRef.mainSchema));
	},
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
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external')),
	get external() {
		return externalSchema;
	},
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#view')),
	get external() {
		return viewExternalSchema;
	},
});
const _viewArticleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewArticle')),
	get associatedProfiles() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema));
	},
	get associatedRefs() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoRepoStrongRef.mainSchema));
	},
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	description: /*#__PURE__*/ v.string(),
	image: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/** @minimum 0 */
	likeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * Available profile previews. Selected deterministically by DID; not a ranking.
	 *
	 * @maxLength 3
	 */
	get likers() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema), [
				/*#__PURE__*/ v.arrayLength(0, 3),
			]),
		);
	},
	get publisher() {
		return /*#__PURE__*/ v.optional(viewArticlePublicationSchema);
	},
	/** @minimum 1 */
	readingTime: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	),
	title: /*#__PURE__*/ v.string(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _viewArticlePublicationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewArticlePublication')),
	get associatedProfiles() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema));
	},
	get associatedRefs() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoRepoStrongRef.mainSchema));
	},
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	description: /*#__PURE__*/ v.string(),
	image: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	logo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	/**
	 * Available profile previews. Selected deterministically by DID; not a ranking.
	 *
	 * @maxLength 3
	 */
	get subscribers() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema), [
				/*#__PURE__*/ v.arrayLength(0, 3),
			]),
		);
	},
	/** @minimum 0 */
	subscriptionCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get theme() {
		return /*#__PURE__*/ v.optional(viewArticlePublicationThemeSchema);
	},
	title: /*#__PURE__*/ v.string(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _viewArticlePublicationThemeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.embed.external#viewArticlePublicationTheme'),
	),
	/** Hex color string, if available. Example: '#ffffff'. */
	accent: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Hex color string, if available. Example: '#ffffff'. */
	accentForeground: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Hex color string, if available. Example: '#ffffff'. */
	background: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Hex color string, if available. Example: '#ffffff'. */
	foreground: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _viewExternalSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewExternal')),
	/** Profiles of the owners of the Atmosphere records that backed this view. */
	get associatedProfiles() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema));
	},
	/** StrongRefs (uri+cid) of the Atmosphere records that backed this view. */
	get associatedRefs() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoRepoStrongRef.mainSchema));
	},
	/** When the external content was created, if available. Example: a publication date, for an article. */
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	description: /*#__PURE__*/ v.string(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/** Estimated reading time in minutes, if applicable and available. */
	readingTime: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get source() {
		return /*#__PURE__*/ v.optional(viewExternalSourceSchema);
	},
	thumb: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	title: /*#__PURE__*/ v.string(),
	/** When the external content was updated, if available. */
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _viewExternalSourceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewExternalSource')),
	description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * Fully-qualified URL where an icon representing the source can be fetched. For example, CDN location
	 * provided by the App View.
	 */
	icon: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	get theme() {
		return /*#__PURE__*/ v.optional(viewExternalSourceThemeSchema);
	},
	title: /*#__PURE__*/ v.string(),
	/** URI of the source, if available. Example: the https:// URL of a site.standard.publication record. */
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _viewExternalSourceThemeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewExternalSourceTheme')),
	get accentForegroundRGB() {
		return /*#__PURE__*/ v.optional(colorRGBSchema);
	},
	get accentRGB() {
		return /*#__PURE__*/ v.optional(colorRGBSchema);
	},
	get backgroundRGB() {
		return /*#__PURE__*/ v.optional(colorRGBSchema);
	},
	get foregroundRGB() {
		return /*#__PURE__*/ v.optional(colorRGBSchema);
	},
});
const _viewGallerySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewGallery')),
	get associatedProfiles() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema));
	},
	get associatedRefs() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoRepoStrongRef.mainSchema));
	},
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	description: /*#__PURE__*/ v.string(),
	/**
	 * The media items in the gallery. Each item may be of a different type, but all types must be supported by
	 * the client.
	 */
	get items() {
		return /*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([viewGalleryImageSchema]));
	},
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/** @minimum 0 */
	likeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * Available profile previews. Selected deterministically by DID; not a ranking.
	 *
	 * @maxLength 3
	 */
	get likers() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema), [
				/*#__PURE__*/ v.arrayLength(0, 3),
			]),
		);
	},
	title: /*#__PURE__*/ v.string(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _viewGalleryImageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewGalleryImage')),
	/** Alt text description of the image, for accessibility. */
	alt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(AppBskyEmbedDefs.aspectRatioSchema);
	},
	/**
	 * Fully-qualified URL where a large version of the image can be fetched. May or may not be the exact
	 * original blob. For example, CDN location provided by the App View.
	 */
	fullsize: /*#__PURE__*/ v.genericUriString(),
	/**
	 * Fully-qualified URL where a thumbnail of the image can be fetched. For example, CDN location provided by
	 * the App View.
	 */
	thumbnail: /*#__PURE__*/ v.genericUriString(),
});
const _viewLivestreamSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewLivestream')),
	/** True if the livestream is currently active at the time this view is served, false if it has ended. */
	active: /*#__PURE__*/ v.boolean(),
	get associatedProfiles() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyActorDefs.profileViewBasicSchema));
	},
	get associatedRefs() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoRepoStrongRef.mainSchema));
	},
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	description: /*#__PURE__*/ v.string(),
	endedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	image: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	startedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	title: /*#__PURE__*/ v.string(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	uri: /*#__PURE__*/ v.genericUriString(),
});

type colorRGB$schematype = typeof _colorRGBSchema;
type external$schematype = typeof _externalSchema;
type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;
type viewArticle$schematype = typeof _viewArticleSchema;
type viewArticlePublication$schematype = typeof _viewArticlePublicationSchema;
type viewArticlePublicationTheme$schematype = typeof _viewArticlePublicationThemeSchema;
type viewExternal$schematype = typeof _viewExternalSchema;
type viewExternalSource$schematype = typeof _viewExternalSourceSchema;
type viewExternalSourceTheme$schematype = typeof _viewExternalSourceThemeSchema;
type viewGallery$schematype = typeof _viewGallerySchema;
type viewGalleryImage$schematype = typeof _viewGalleryImageSchema;
type viewLivestream$schematype = typeof _viewLivestreamSchema;

export interface colorRGBSchema extends colorRGB$schematype {}
export interface externalSchema extends external$schematype {}
export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}
export interface viewArticleSchema extends viewArticle$schematype {}
export interface viewArticlePublicationSchema extends viewArticlePublication$schematype {}
export interface viewArticlePublicationThemeSchema extends viewArticlePublicationTheme$schematype {}
export interface viewExternalSchema extends viewExternal$schematype {}
export interface viewExternalSourceSchema extends viewExternalSource$schematype {}
export interface viewExternalSourceThemeSchema extends viewExternalSourceTheme$schematype {}
export interface viewGallerySchema extends viewGallery$schematype {}
export interface viewGalleryImageSchema extends viewGalleryImage$schematype {}
export interface viewLivestreamSchema extends viewLivestream$schematype {}

export const colorRGBSchema = _colorRGBSchema as colorRGBSchema;
export const externalSchema = _externalSchema as externalSchema;
export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;
export const viewArticleSchema = _viewArticleSchema as viewArticleSchema;
export const viewArticlePublicationSchema = _viewArticlePublicationSchema as viewArticlePublicationSchema;
export const viewArticlePublicationThemeSchema =
	_viewArticlePublicationThemeSchema as viewArticlePublicationThemeSchema;
export const viewExternalSchema = _viewExternalSchema as viewExternalSchema;
export const viewExternalSourceSchema = _viewExternalSourceSchema as viewExternalSourceSchema;
export const viewExternalSourceThemeSchema = _viewExternalSourceThemeSchema as viewExternalSourceThemeSchema;
export const viewGallerySchema = _viewGallerySchema as viewGallerySchema;
export const viewGalleryImageSchema = _viewGalleryImageSchema as viewGalleryImageSchema;
export const viewLivestreamSchema = _viewLivestreamSchema as viewLivestreamSchema;

export interface ColorRGB extends v.InferInput<typeof colorRGBSchema> {}
export interface External extends v.InferInput<typeof externalSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
export interface ViewArticle extends v.InferInput<typeof viewArticleSchema> {}
export interface ViewArticlePublication extends v.InferInput<typeof viewArticlePublicationSchema> {}
export interface ViewArticlePublicationTheme extends v.InferInput<typeof viewArticlePublicationThemeSchema> {}
export interface ViewExternal extends v.InferInput<typeof viewExternalSchema> {}
export interface ViewExternalSource extends v.InferInput<typeof viewExternalSourceSchema> {}
export interface ViewExternalSourceTheme extends v.InferInput<typeof viewExternalSourceThemeSchema> {}
export interface ViewGallery extends v.InferInput<typeof viewGallerySchema> {}
export interface ViewGalleryImage extends v.InferInput<typeof viewGalleryImageSchema> {}
export interface ViewLivestream extends v.InferInput<typeof viewLivestreamSchema> {}
