import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

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
const _viewExternalSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewExternal')),
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

type colorRGB$schematype = typeof _colorRGBSchema;
type external$schematype = typeof _externalSchema;
type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;
type viewExternal$schematype = typeof _viewExternalSchema;
type viewExternalSource$schematype = typeof _viewExternalSourceSchema;
type viewExternalSourceTheme$schematype = typeof _viewExternalSourceThemeSchema;

export interface colorRGBSchema extends colorRGB$schematype {}
export interface externalSchema extends external$schematype {}
export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}
export interface viewExternalSchema extends viewExternal$schematype {}
export interface viewExternalSourceSchema extends viewExternalSource$schematype {}
export interface viewExternalSourceThemeSchema extends viewExternalSourceTheme$schematype {}

export const colorRGBSchema = _colorRGBSchema as colorRGBSchema;
export const externalSchema = _externalSchema as externalSchema;
export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;
export const viewExternalSchema = _viewExternalSchema as viewExternalSchema;
export const viewExternalSourceSchema = _viewExternalSourceSchema as viewExternalSourceSchema;
export const viewExternalSourceThemeSchema = _viewExternalSourceThemeSchema as viewExternalSourceThemeSchema;

export interface ColorRGB extends v.InferInput<typeof colorRGBSchema> {}
export interface External extends v.InferInput<typeof externalSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
export interface ViewExternal extends v.InferInput<typeof viewExternalSchema> {}
export interface ViewExternalSource extends v.InferInput<typeof viewExternalSourceSchema> {}
export interface ViewExternalSourceTheme extends v.InferInput<typeof viewExternalSourceThemeSchema> {}
