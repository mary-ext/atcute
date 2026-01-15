import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as PubLeafletThemeBackgroundImage from './theme/backgroundImage.js';
import * as PubLeafletThemeColor from './theme/color.js';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.publication'),
		base_path: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @maxLength 2000
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 2000)]),
		),
		/**
		 * @accept image/*
		 * @maxSize 1000000
		 */
		icon: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
		/**
		 * @maxLength 2000
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 2000)]),
		get preferences() {
			return /*#__PURE__*/ v.optional(preferencesSchema);
		},
		get theme() {
			return /*#__PURE__*/ v.optional(themeSchema);
		},
	}),
);
const _preferencesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.publication#preferences')),
	/**
	 * @default true
	 */
	showComments: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
	/**
	 * @default true
	 */
	showInDiscover: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
	/**
	 * @default true
	 */
	showMentions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
	/**
	 * @default false
	 */
	showPrevNext: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
});
const _themeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.publication#theme')),
	get accentBackground() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([PubLeafletThemeColor.rgbSchema, PubLeafletThemeColor.rgbaSchema]),
		);
	},
	get accentText() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([PubLeafletThemeColor.rgbSchema, PubLeafletThemeColor.rgbaSchema]),
		);
	},
	get backgroundColor() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([PubLeafletThemeColor.rgbSchema, PubLeafletThemeColor.rgbaSchema]),
		);
	},
	get backgroundImage() {
		return /*#__PURE__*/ v.optional(PubLeafletThemeBackgroundImage.mainSchema);
	},
	get pageBackground() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([PubLeafletThemeColor.rgbSchema, PubLeafletThemeColor.rgbaSchema]),
		);
	},
	/**
	 * @minimum 0
	 * @maximum 1600
	 */
	pageWidth: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 1600)]),
	),
	get primary() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([PubLeafletThemeColor.rgbSchema, PubLeafletThemeColor.rgbaSchema]),
		);
	},
	/**
	 * @default false
	 */
	showPageBackground: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
});

type main$schematype = typeof _mainSchema;
type preferences$schematype = typeof _preferencesSchema;
type theme$schematype = typeof _themeSchema;

export interface mainSchema extends main$schematype {}
export interface preferencesSchema extends preferences$schematype {}
export interface themeSchema extends theme$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const preferencesSchema = _preferencesSchema as preferencesSchema;
export const themeSchema = _themeSchema as themeSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Preferences extends v.InferInput<typeof preferencesSchema> {}
export interface Theme extends v.InferInput<typeof themeSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'pub.leaflet.publication': mainSchema;
	}
}
