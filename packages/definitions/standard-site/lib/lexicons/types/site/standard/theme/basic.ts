import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as SiteStandardThemeColor from './color.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('site.standard.theme.basic')),
	/**
	 * Color used for links and button backgrounds.
	 */
	get accent() {
		return /*#__PURE__*/ v.variant([SiteStandardThemeColor.rgbSchema]);
	},
	/**
	 * Color used for button text.
	 */
	get accentForeground() {
		return /*#__PURE__*/ v.variant([SiteStandardThemeColor.rgbSchema]);
	},
	/**
	 * Color used for content background.
	 */
	get background() {
		return /*#__PURE__*/ v.variant([SiteStandardThemeColor.rgbSchema]);
	},
	/**
	 * Color used for content text.
	 */
	get foreground() {
		return /*#__PURE__*/ v.variant([SiteStandardThemeColor.rgbSchema]);
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
