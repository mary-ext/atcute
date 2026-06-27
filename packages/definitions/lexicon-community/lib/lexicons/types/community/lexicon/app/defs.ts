import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _accountIndicatorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.app.defs#accountIndicator')),
	/** Record collection to look for in an account repository. */
	collection: /*#__PURE__*/ v.nsidString(),
	/** Optional record key to look for within the collection. */
	rkey: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.recordKeyString()),
});
const _aspectRatioSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.app.defs#aspectRatio')),
	/** @minimum 1 */
	height: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/** @minimum 1 */
	width: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
});
const _discontinuedSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#discontinued');
const _imageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.app.defs#image')),
	/**
	 * Alt text description of the image, for accessibility.
	 *
	 * @maxLength 1000
	 * @maxGraphemes 300
	 */
	alt: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 1000),
		/*#__PURE__*/ v.stringGraphemes(0, 300),
	]),
	get aspectRatio() {
		return /*#__PURE__*/ v.optional(aspectRatioSchema);
	},
	/**
	 * The raw image file.
	 *
	 * @accept image/*
	 * @maxSize 2000000
	 */
	image: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
			/*#__PURE__*/ v.blobSize(2000000),
			/*#__PURE__*/ v.blobAccept(['image/*']),
		]),
	),
	/** How directories and stores should use the image. Omit this field when no known purpose fits. */
	purpose: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			| 'community.lexicon.app.defs#purposeAd'
			| 'community.lexicon.app.defs#purposeAppStore'
			| 'community.lexicon.app.defs#purposeBanner'
			| 'community.lexicon.app.defs#purposeHero'
			| 'community.lexicon.app.defs#purposeIcon'
			| 'community.lexicon.app.defs#purposeLogo'
			| 'community.lexicon.app.defs#purposeScreenshot'
			| 'community.lexicon.app.defs#purposeSocialCard'
			| (string & {})
		>(),
	),
	/** Remote image URI. */
	uri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
});
const _lexiconInteropSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.app.defs#lexiconInterop')),
	/** Lexicon collections this app reads, displays, imports, or otherwise consumes. */
	consumes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString())),
	/** Lexicon collections this app creates or publishes records for. */
	produces: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString())),
});
const _linkSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.app.defs#link')),
	/**
	 * Human-readable label for the URI.
	 *
	 * @maxLength 100
	 * @maxGraphemes 50
	 */
	label: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 100),
			/*#__PURE__*/ v.stringGraphemes(0, 50),
		]),
	),
	/** Known role of this link, if any. */
	get role() {
		return /*#__PURE__*/ v.optional(linkRoleSchema);
	},
	/** Destination URI. */
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _linkRoleSchema = /*#__PURE__*/ v.string<
	| 'community.lexicon.app.defs#linkRoleAppStore'
	| 'community.lexicon.app.defs#linkRoleChangelog'
	| 'community.lexicon.app.defs#linkRoleDocs'
	| 'community.lexicon.app.defs#linkRoleFDroid'
	| 'community.lexicon.app.defs#linkRolePlayStore'
	| 'community.lexicon.app.defs#linkRolePrivacyPolicy'
	| 'community.lexicon.app.defs#linkRoleSourceCode'
	| 'community.lexicon.app.defs#linkRoleStatus'
	| 'community.lexicon.app.defs#linkRoleSupport'
	| 'community.lexicon.app.defs#linkRoleTermsOfService'
	| 'community.lexicon.app.defs#linkRoleWebManifest'
	| 'community.lexicon.app.defs#linkRoleWebsite'
	| (string & {})
>();
const _linkRoleAppStoreSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRoleAppStore');
const _linkRoleChangelogSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRoleChangelog');
const _linkRoleDocsSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRoleDocs');
const _linkRoleFDroidSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRoleFDroid');
const _linkRolePlayStoreSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRolePlayStore');
const _linkRolePrivacyPolicySchema = /*#__PURE__*/ v.literal(
	'community.lexicon.app.defs#linkRolePrivacyPolicy',
);
const _linkRoleSourceCodeSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRoleSourceCode');
const _linkRoleStatusSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRoleStatus');
const _linkRoleSupportSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRoleSupport');
const _linkRoleTermsOfServiceSchema = /*#__PURE__*/ v.literal(
	'community.lexicon.app.defs#linkRoleTermsOfService',
);
const _linkRoleWebManifestSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRoleWebManifest');
const _linkRoleWebsiteSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#linkRoleWebsite');
const _platformSchema = /*#__PURE__*/ v.string<
	| 'community.lexicon.app.defs#platformAndroid'
	| 'community.lexicon.app.defs#platformCLI'
	| 'community.lexicon.app.defs#platformIOS'
	| 'community.lexicon.app.defs#platformLinux'
	| 'community.lexicon.app.defs#platformMacOS'
	| 'community.lexicon.app.defs#platformWeb'
	| 'community.lexicon.app.defs#platformWindows'
	| (string & {})
>();
const _platformAndroidSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#platformAndroid');
const _platformCLISchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#platformCLI');
const _platformIOSSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#platformIOS');
const _platformLinuxSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#platformLinux');
const _platformMacOSSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#platformMacOS');
const _platformWebSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#platformWeb');
const _platformWindowsSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#platformWindows');
const _previewSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#preview');
const _purposeAdSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#purposeAd');
const _purposeAppStoreSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#purposeAppStore');
const _purposeBannerSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#purposeBanner');
const _purposeHeroSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#purposeHero');
const _purposeIconSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#purposeIcon');
const _purposeLogoSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#purposeLogo');
const _purposeScreenshotSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#purposeScreenshot');
const _purposeSocialCardSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#purposeSocialCard');
const _releasedSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#released');
const _statusSchema = /*#__PURE__*/ v.string<
	| 'community.lexicon.app.defs#discontinued'
	| 'community.lexicon.app.defs#preview'
	| 'community.lexicon.app.defs#released'
	| 'community.lexicon.app.defs#unmaintained'
	| 'community.lexicon.app.defs#unreleased'
	| (string & {})
>();
const _unmaintainedSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#unmaintained');
const _unreleasedSchema = /*#__PURE__*/ v.literal('community.lexicon.app.defs#unreleased');

type accountIndicator$schematype = typeof _accountIndicatorSchema;
type aspectRatio$schematype = typeof _aspectRatioSchema;
type discontinued$schematype = typeof _discontinuedSchema;
type image$schematype = typeof _imageSchema;
type lexiconInterop$schematype = typeof _lexiconInteropSchema;
type link$schematype = typeof _linkSchema;
type linkRole$schematype = typeof _linkRoleSchema;
type linkRoleAppStore$schematype = typeof _linkRoleAppStoreSchema;
type linkRoleChangelog$schematype = typeof _linkRoleChangelogSchema;
type linkRoleDocs$schematype = typeof _linkRoleDocsSchema;
type linkRoleFDroid$schematype = typeof _linkRoleFDroidSchema;
type linkRolePlayStore$schematype = typeof _linkRolePlayStoreSchema;
type linkRolePrivacyPolicy$schematype = typeof _linkRolePrivacyPolicySchema;
type linkRoleSourceCode$schematype = typeof _linkRoleSourceCodeSchema;
type linkRoleStatus$schematype = typeof _linkRoleStatusSchema;
type linkRoleSupport$schematype = typeof _linkRoleSupportSchema;
type linkRoleTermsOfService$schematype = typeof _linkRoleTermsOfServiceSchema;
type linkRoleWebManifest$schematype = typeof _linkRoleWebManifestSchema;
type linkRoleWebsite$schematype = typeof _linkRoleWebsiteSchema;
type platform$schematype = typeof _platformSchema;
type platformAndroid$schematype = typeof _platformAndroidSchema;
type platformCLI$schematype = typeof _platformCLISchema;
type platformIOS$schematype = typeof _platformIOSSchema;
type platformLinux$schematype = typeof _platformLinuxSchema;
type platformMacOS$schematype = typeof _platformMacOSSchema;
type platformWeb$schematype = typeof _platformWebSchema;
type platformWindows$schematype = typeof _platformWindowsSchema;
type preview$schematype = typeof _previewSchema;
type purposeAd$schematype = typeof _purposeAdSchema;
type purposeAppStore$schematype = typeof _purposeAppStoreSchema;
type purposeBanner$schematype = typeof _purposeBannerSchema;
type purposeHero$schematype = typeof _purposeHeroSchema;
type purposeIcon$schematype = typeof _purposeIconSchema;
type purposeLogo$schematype = typeof _purposeLogoSchema;
type purposeScreenshot$schematype = typeof _purposeScreenshotSchema;
type purposeSocialCard$schematype = typeof _purposeSocialCardSchema;
type released$schematype = typeof _releasedSchema;
type status$schematype = typeof _statusSchema;
type unmaintained$schematype = typeof _unmaintainedSchema;
type unreleased$schematype = typeof _unreleasedSchema;

export interface accountIndicatorSchema extends accountIndicator$schematype {}
export interface aspectRatioSchema extends aspectRatio$schematype {}
export interface discontinuedSchema extends discontinued$schematype {}
export interface imageSchema extends image$schematype {}
export interface lexiconInteropSchema extends lexiconInterop$schematype {}
export interface linkSchema extends link$schematype {}
export interface linkRoleSchema extends linkRole$schematype {}
export interface linkRoleAppStoreSchema extends linkRoleAppStore$schematype {}
export interface linkRoleChangelogSchema extends linkRoleChangelog$schematype {}
export interface linkRoleDocsSchema extends linkRoleDocs$schematype {}
export interface linkRoleFDroidSchema extends linkRoleFDroid$schematype {}
export interface linkRolePlayStoreSchema extends linkRolePlayStore$schematype {}
export interface linkRolePrivacyPolicySchema extends linkRolePrivacyPolicy$schematype {}
export interface linkRoleSourceCodeSchema extends linkRoleSourceCode$schematype {}
export interface linkRoleStatusSchema extends linkRoleStatus$schematype {}
export interface linkRoleSupportSchema extends linkRoleSupport$schematype {}
export interface linkRoleTermsOfServiceSchema extends linkRoleTermsOfService$schematype {}
export interface linkRoleWebManifestSchema extends linkRoleWebManifest$schematype {}
export interface linkRoleWebsiteSchema extends linkRoleWebsite$schematype {}
export interface platformSchema extends platform$schematype {}
export interface platformAndroidSchema extends platformAndroid$schematype {}
export interface platformCLISchema extends platformCLI$schematype {}
export interface platformIOSSchema extends platformIOS$schematype {}
export interface platformLinuxSchema extends platformLinux$schematype {}
export interface platformMacOSSchema extends platformMacOS$schematype {}
export interface platformWebSchema extends platformWeb$schematype {}
export interface platformWindowsSchema extends platformWindows$schematype {}
export interface previewSchema extends preview$schematype {}
export interface purposeAdSchema extends purposeAd$schematype {}
export interface purposeAppStoreSchema extends purposeAppStore$schematype {}
export interface purposeBannerSchema extends purposeBanner$schematype {}
export interface purposeHeroSchema extends purposeHero$schematype {}
export interface purposeIconSchema extends purposeIcon$schematype {}
export interface purposeLogoSchema extends purposeLogo$schematype {}
export interface purposeScreenshotSchema extends purposeScreenshot$schematype {}
export interface purposeSocialCardSchema extends purposeSocialCard$schematype {}
export interface releasedSchema extends released$schematype {}
export interface statusSchema extends status$schematype {}
export interface unmaintainedSchema extends unmaintained$schematype {}
export interface unreleasedSchema extends unreleased$schematype {}

export const accountIndicatorSchema = _accountIndicatorSchema as accountIndicatorSchema;
export const aspectRatioSchema = _aspectRatioSchema as aspectRatioSchema;
export const discontinuedSchema = _discontinuedSchema as discontinuedSchema;
export const imageSchema = _imageSchema as imageSchema;
export const lexiconInteropSchema = _lexiconInteropSchema as lexiconInteropSchema;
export const linkSchema = _linkSchema as linkSchema;
export const linkRoleSchema = _linkRoleSchema as linkRoleSchema;
export const linkRoleAppStoreSchema = _linkRoleAppStoreSchema as linkRoleAppStoreSchema;
export const linkRoleChangelogSchema = _linkRoleChangelogSchema as linkRoleChangelogSchema;
export const linkRoleDocsSchema = _linkRoleDocsSchema as linkRoleDocsSchema;
export const linkRoleFDroidSchema = _linkRoleFDroidSchema as linkRoleFDroidSchema;
export const linkRolePlayStoreSchema = _linkRolePlayStoreSchema as linkRolePlayStoreSchema;
export const linkRolePrivacyPolicySchema = _linkRolePrivacyPolicySchema as linkRolePrivacyPolicySchema;
export const linkRoleSourceCodeSchema = _linkRoleSourceCodeSchema as linkRoleSourceCodeSchema;
export const linkRoleStatusSchema = _linkRoleStatusSchema as linkRoleStatusSchema;
export const linkRoleSupportSchema = _linkRoleSupportSchema as linkRoleSupportSchema;
export const linkRoleTermsOfServiceSchema = _linkRoleTermsOfServiceSchema as linkRoleTermsOfServiceSchema;
export const linkRoleWebManifestSchema = _linkRoleWebManifestSchema as linkRoleWebManifestSchema;
export const linkRoleWebsiteSchema = _linkRoleWebsiteSchema as linkRoleWebsiteSchema;
export const platformSchema = _platformSchema as platformSchema;
export const platformAndroidSchema = _platformAndroidSchema as platformAndroidSchema;
export const platformCLISchema = _platformCLISchema as platformCLISchema;
export const platformIOSSchema = _platformIOSSchema as platformIOSSchema;
export const platformLinuxSchema = _platformLinuxSchema as platformLinuxSchema;
export const platformMacOSSchema = _platformMacOSSchema as platformMacOSSchema;
export const platformWebSchema = _platformWebSchema as platformWebSchema;
export const platformWindowsSchema = _platformWindowsSchema as platformWindowsSchema;
export const previewSchema = _previewSchema as previewSchema;
export const purposeAdSchema = _purposeAdSchema as purposeAdSchema;
export const purposeAppStoreSchema = _purposeAppStoreSchema as purposeAppStoreSchema;
export const purposeBannerSchema = _purposeBannerSchema as purposeBannerSchema;
export const purposeHeroSchema = _purposeHeroSchema as purposeHeroSchema;
export const purposeIconSchema = _purposeIconSchema as purposeIconSchema;
export const purposeLogoSchema = _purposeLogoSchema as purposeLogoSchema;
export const purposeScreenshotSchema = _purposeScreenshotSchema as purposeScreenshotSchema;
export const purposeSocialCardSchema = _purposeSocialCardSchema as purposeSocialCardSchema;
export const releasedSchema = _releasedSchema as releasedSchema;
export const statusSchema = _statusSchema as statusSchema;
export const unmaintainedSchema = _unmaintainedSchema as unmaintainedSchema;
export const unreleasedSchema = _unreleasedSchema as unreleasedSchema;

export interface AccountIndicator extends v.InferInput<typeof accountIndicatorSchema> {}
export interface AspectRatio extends v.InferInput<typeof aspectRatioSchema> {}
export type Discontinued = v.InferInput<typeof discontinuedSchema>;
export interface Image extends v.InferInput<typeof imageSchema> {}
export interface LexiconInterop extends v.InferInput<typeof lexiconInteropSchema> {}
export interface Link extends v.InferInput<typeof linkSchema> {}
export type LinkRole = v.InferInput<typeof linkRoleSchema>;
export type LinkRoleAppStore = v.InferInput<typeof linkRoleAppStoreSchema>;
export type LinkRoleChangelog = v.InferInput<typeof linkRoleChangelogSchema>;
export type LinkRoleDocs = v.InferInput<typeof linkRoleDocsSchema>;
export type LinkRoleFDroid = v.InferInput<typeof linkRoleFDroidSchema>;
export type LinkRolePlayStore = v.InferInput<typeof linkRolePlayStoreSchema>;
export type LinkRolePrivacyPolicy = v.InferInput<typeof linkRolePrivacyPolicySchema>;
export type LinkRoleSourceCode = v.InferInput<typeof linkRoleSourceCodeSchema>;
export type LinkRoleStatus = v.InferInput<typeof linkRoleStatusSchema>;
export type LinkRoleSupport = v.InferInput<typeof linkRoleSupportSchema>;
export type LinkRoleTermsOfService = v.InferInput<typeof linkRoleTermsOfServiceSchema>;
export type LinkRoleWebManifest = v.InferInput<typeof linkRoleWebManifestSchema>;
export type LinkRoleWebsite = v.InferInput<typeof linkRoleWebsiteSchema>;
export type Platform = v.InferInput<typeof platformSchema>;
export type PlatformAndroid = v.InferInput<typeof platformAndroidSchema>;
export type PlatformCLI = v.InferInput<typeof platformCLISchema>;
export type PlatformIOS = v.InferInput<typeof platformIOSSchema>;
export type PlatformLinux = v.InferInput<typeof platformLinuxSchema>;
export type PlatformMacOS = v.InferInput<typeof platformMacOSSchema>;
export type PlatformWeb = v.InferInput<typeof platformWebSchema>;
export type PlatformWindows = v.InferInput<typeof platformWindowsSchema>;
export type Preview = v.InferInput<typeof previewSchema>;
export type PurposeAd = v.InferInput<typeof purposeAdSchema>;
export type PurposeAppStore = v.InferInput<typeof purposeAppStoreSchema>;
export type PurposeBanner = v.InferInput<typeof purposeBannerSchema>;
export type PurposeHero = v.InferInput<typeof purposeHeroSchema>;
export type PurposeIcon = v.InferInput<typeof purposeIconSchema>;
export type PurposeLogo = v.InferInput<typeof purposeLogoSchema>;
export type PurposeScreenshot = v.InferInput<typeof purposeScreenshotSchema>;
export type PurposeSocialCard = v.InferInput<typeof purposeSocialCardSchema>;
export type Released = v.InferInput<typeof releasedSchema>;
export type Status = v.InferInput<typeof statusSchema>;
export type Unmaintained = v.InferInput<typeof unmaintainedSchema>;
export type Unreleased = v.InferInput<typeof unreleasedSchema>;
