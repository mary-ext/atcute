import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyEmbedExternal from '../embed/external.ts';

const _announcementBannerSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getAtmosphereExploreTab#announcementBanner'),
	),
	/** @maxLength 4096 */
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	id: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	image: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	overlayColor: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	textColor: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	title: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	url: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
});
const _appCardSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getAtmosphereExploreTab#appCard'),
	),
	/** @maxLength 4096 */
	backgroundImage: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	category: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	id: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	logo: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	overlayColor: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	textColor: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	title: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
	/** @maxLength 4096 */
	url: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [/*#__PURE__*/ v.stringLength(0, 4096)]),
	),
});
const _articleItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getAtmosphereExploreTab#articleItem'),
	),
	featured: /*#__PURE__*/ v.boolean(),
	get view() {
		return AppBskyEmbedExternal.viewArticleSchema;
	},
});
const _galleryItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getAtmosphereExploreTab#galleryItem'),
	),
	featured: /*#__PURE__*/ v.boolean(),
	get view() {
		return AppBskyEmbedExternal.viewGallerySchema;
	},
});
const _livestreamItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getAtmosphereExploreTab#livestreamItem'),
	),
	featured: /*#__PURE__*/ v.boolean(),
	get view() {
		return AppBskyEmbedExternal.viewLivestreamSchema;
	},
});
const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getAtmosphereExploreTab', {
	params: /*#__PURE__*/ v.object({
		/** The ISO 3166-1 alpha-2 country code used to select curated content. */
		countryCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Preferred languages. Currently ignored. */
		langs: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.languageCodeString())),
		/** The ISO 3166-2 region code used to select curated content. */
		regionCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get announcementBanner() {
				return /*#__PURE__*/ v.optional(announcementBannerSchema);
			},
			/** @maxLength 100 */
			get apps() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(appCardSchema), [
					/*#__PURE__*/ v.arrayLength(0, 100),
				]);
			},
			get articles() {
				return /*#__PURE__*/ v.array(articleItemSchema);
			},
			get livestreams() {
				return /*#__PURE__*/ v.array(livestreamItemSchema);
			},
			get photos() {
				return /*#__PURE__*/ v.array(galleryItemSchema);
			},
			get publications() {
				return /*#__PURE__*/ v.array(publicationItemSchema);
			},
		}),
	},
});
const _publicationItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getAtmosphereExploreTab#publicationItem'),
	),
	featured: /*#__PURE__*/ v.boolean(),
	get view() {
		return AppBskyEmbedExternal.viewArticlePublicationSchema;
	},
});

type announcementBanner$schematype = typeof _announcementBannerSchema;
type appCard$schematype = typeof _appCardSchema;
type articleItem$schematype = typeof _articleItemSchema;
type galleryItem$schematype = typeof _galleryItemSchema;
type livestreamItem$schematype = typeof _livestreamItemSchema;
type main$schematype = typeof _mainSchema;
type publicationItem$schematype = typeof _publicationItemSchema;

export interface announcementBannerSchema extends announcementBanner$schematype {}
export interface appCardSchema extends appCard$schematype {}
export interface articleItemSchema extends articleItem$schematype {}
export interface galleryItemSchema extends galleryItem$schematype {}
export interface livestreamItemSchema extends livestreamItem$schematype {}
export interface mainSchema extends main$schematype {}
export interface publicationItemSchema extends publicationItem$schematype {}

export const announcementBannerSchema = _announcementBannerSchema as announcementBannerSchema;
export const appCardSchema = _appCardSchema as appCardSchema;
export const articleItemSchema = _articleItemSchema as articleItemSchema;
export const galleryItemSchema = _galleryItemSchema as galleryItemSchema;
export const livestreamItemSchema = _livestreamItemSchema as livestreamItemSchema;
export const mainSchema = _mainSchema as mainSchema;
export const publicationItemSchema = _publicationItemSchema as publicationItemSchema;

export interface AnnouncementBanner extends v.InferInput<typeof announcementBannerSchema> {}
export interface AppCard extends v.InferInput<typeof appCardSchema> {}
export interface ArticleItem extends v.InferInput<typeof articleItemSchema> {}
export interface GalleryItem extends v.InferInput<typeof galleryItemSchema> {}
export interface LivestreamItem extends v.InferInput<typeof livestreamItemSchema> {}
export interface PublicationItem extends v.InferInput<typeof publicationItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getAtmosphereExploreTab': mainSchema;
	}
}
