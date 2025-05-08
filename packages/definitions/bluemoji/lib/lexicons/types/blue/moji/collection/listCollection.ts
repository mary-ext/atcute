import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as BlueMojiCollectionItem from './item.js';

const _itemViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.collection.listCollection#itemView')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	get record() {
		return BlueMojiCollectionItem.itemViewSchema;
	},
});
const _mainSchema = /*#__PURE__*/ v.xrpcQuery('blue.moji.collection.listCollection', {
	params: /*#__PURE__*/ v.object({
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		reverse: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get items() {
				return /*#__PURE__*/ v.array(BlueMojiCollectionItem.itemViewSchema);
			},
		}),
	},
});

type itemView$schematype = typeof _itemViewSchema;
type main$schematype = typeof _mainSchema;

export interface itemViewSchema extends itemView$schematype {}
export interface mainSchema extends main$schematype {}

export const itemViewSchema = _itemViewSchema as itemViewSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface ItemView extends v.InferInput<typeof itemViewSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'blue.moji.collection.listCollection': mainSchema;
	}
}
