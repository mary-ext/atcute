import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as SiteStandardThemeColor from './color.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('site.standard.theme.basic'),
		/** Color used for links and button backgrounds. */
		get accent() {
			return /*#__PURE__*/ v.variant([SiteStandardThemeColor.rgbSchema]);
		},
		/** Color used for button text. */
		get accentForeground() {
			return /*#__PURE__*/ v.variant([SiteStandardThemeColor.rgbSchema]);
		},
		/** Color used for content background. */
		get background() {
			return /*#__PURE__*/ v.variant([SiteStandardThemeColor.rgbSchema]);
		},
		/** Color used for content text. */
		get foreground() {
			return /*#__PURE__*/ v.variant([SiteStandardThemeColor.rgbSchema]);
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'site.standard.theme.basic': mainSchema;
	}
}
