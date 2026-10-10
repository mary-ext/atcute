import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletThemeColor from './color.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.theme.page')),
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
	get pageBackground() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([PubLeafletThemeColor.rgbSchema, PubLeafletThemeColor.rgbaSchema]),
		);
	},
	get primary() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.variant([PubLeafletThemeColor.rgbSchema, PubLeafletThemeColor.rgbaSchema]),
		);
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
