import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as BlueMojiCollectionItem from './item.js';

const _mainSchema = /*#__PURE__*/ v.query('blue.moji.collection.getItem', {
	params: /*#__PURE__*/ v.object({
		repo: /*#__PURE__*/ v.actorIdentifierString(),
		name: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			uri: /*#__PURE__*/ v.resourceUriString(),
			get item() {
				return BlueMojiCollectionItem.itemViewSchema;
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'blue.moji.collection.getItem': mainSchema;
	}
}
