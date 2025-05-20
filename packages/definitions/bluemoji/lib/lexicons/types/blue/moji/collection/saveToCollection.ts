import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as BlueMojiCollectionItem from './item.js';

const _mainSchema = /*#__PURE__*/ v.procedure('blue.moji.collection.saveToCollection', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 15)]),
			renameTo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			source: /*#__PURE__*/ v.actorIdentifierString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get item() {
				return BlueMojiCollectionItem.itemViewSchema;
			},
			uri: /*#__PURE__*/ v.resourceUriString(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'blue.moji.collection.saveToCollection': mainSchema;
	}
}
