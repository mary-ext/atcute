import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as BlueMojiCollectionItem from './item.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('blue.moji.collection.saveToCollection', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The source Bluemoji name/rkey.
			 * @maxLength 15
			 */
			name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 15)]),
			/**
			 * The alias to save the Bluemoji to in the current logged-in user's repo.
			 */
			renameTo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * The handle or DID of the repo to copy from.
			 */
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

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'blue.moji.collection.saveToCollection': mainSchema;
	}
}
