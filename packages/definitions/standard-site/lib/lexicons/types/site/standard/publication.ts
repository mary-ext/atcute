import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as SiteStandardThemeBasic from './theme/basic.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('site.standard.publication'),
		/**
		 * Simplified publication theme for tools and apps to utilize when displaying content.
		 */
		get basicTheme() {
			return /*#__PURE__*/ v.optional(SiteStandardThemeBasic.mainSchema);
		},
		/**
		 * Brief description of the publication.
		 * @maxLength 30000
		 * @maxGraphemes 3000
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 30000),
				/*#__PURE__*/ v.stringGraphemes(0, 3000),
			]),
		),
		/**
		 * Square image to identify the publication. Should be at least 256x256.
		 * @accept image/*
		 * @maxSize 1000000
		 */
		icon: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
		/**
		 * Name of the publication.
		 * @maxLength 5000
		 * @maxGraphemes 500
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 5000),
			/*#__PURE__*/ v.stringGraphemes(0, 500),
		]),
		/**
		 * Object containing platform specific preferences (with a few shared properties).
		 */
		get preferences() {
			return /*#__PURE__*/ v.optional(preferencesSchema);
		},
		/**
		 * Base publication url (ex: https://standard.site). The canonical document URL is formed by combining this value with the document path.
		 */
		url: /*#__PURE__*/ v.genericUriString(),
	}),
);
const _preferencesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('site.standard.publication#preferences')),
	/**
	 * Boolean which decides whether the publication should appear in discovery feeds.
	 * @default true
	 */
	showInDiscover: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
});

type main$schematype = typeof _mainSchema;
type preferences$schematype = typeof _preferencesSchema;

export interface mainSchema extends main$schematype {}
export interface preferencesSchema extends preferences$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const preferencesSchema = _preferencesSchema as preferencesSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Preferences extends v.InferInput<typeof preferencesSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'site.standard.publication': mainSchema;
	}
}
