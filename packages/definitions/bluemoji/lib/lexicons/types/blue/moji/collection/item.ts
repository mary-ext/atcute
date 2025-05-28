import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _blob_v0Schema = /*#__PURE__*/ v.blob();
const _bytes_v0Schema = /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.bytes(), [
	/*#__PURE__*/ v.bytesSize(0, 65536),
]);
const _formats_v0Schema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.collection.item#formats_v0')),
	get apng_128() {
		return /*#__PURE__*/ v.optional(bytes_v0Schema);
	},
	get gif_128() {
		return /*#__PURE__*/ v.optional(blob_v0Schema);
	},
	get lottie() {
		return /*#__PURE__*/ v.optional(bytes_v0Schema);
	},
	original: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
	get png_128() {
		return /*#__PURE__*/ v.optional(blob_v0Schema);
	},
	get webp_128() {
		return /*#__PURE__*/ v.optional(blob_v0Schema);
	},
});
const _itemViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.collection.item#itemView')),
	adultOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	alt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get formats() {
		return formats_v0Schema;
	},
	name: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('blue.moji.collection.item'),
		adultOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		alt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		copyOf: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		fallbackText: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 10),
				/*#__PURE__*/ v.stringGraphemes(0, 1),
			]),
			'◌',
		),
		get formats() {
			return /*#__PURE__*/ v.variant([formats_v0Schema]);
		},
		get labels() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]));
		},
		name: /*#__PURE__*/ v.string(),
	}),
);

type blob_v0$schematype = typeof _blob_v0Schema;
type bytes_v0$schematype = typeof _bytes_v0Schema;
type formats_v0$schematype = typeof _formats_v0Schema;
type itemView$schematype = typeof _itemViewSchema;
type main$schematype = typeof _mainSchema;

export interface blob_v0Schema extends blob_v0$schematype {}
export interface bytes_v0Schema extends bytes_v0$schematype {}
export interface formats_v0Schema extends formats_v0$schematype {}
export interface itemViewSchema extends itemView$schematype {}
export interface mainSchema extends main$schematype {}

export const blob_v0Schema = _blob_v0Schema as blob_v0Schema;
export const bytes_v0Schema = _bytes_v0Schema as bytes_v0Schema;
export const formats_v0Schema = _formats_v0Schema as formats_v0Schema;
export const itemViewSchema = _itemViewSchema as itemViewSchema;
export const mainSchema = _mainSchema as mainSchema;

export type Blob_v0 = v.InferInput<typeof blob_v0Schema>;
export type Bytes_v0 = v.InferInput<typeof bytes_v0Schema>;
export interface Formats_v0 extends v.InferInput<typeof formats_v0Schema> {}
export interface ItemView extends v.InferInput<typeof itemViewSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'blue.moji.collection.item': mainSchema;
	}
}
