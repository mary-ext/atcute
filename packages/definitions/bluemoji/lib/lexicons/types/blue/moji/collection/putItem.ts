import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as BlueMojiCollectionItem from './item.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('blue.moji.collection.putItem', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get item() {
				return BlueMojiCollectionItem.itemViewSchema;
			},
			/**
			 * The handle or DID of the repo (aka, current account).
			 */
			repo: /*#__PURE__*/ v.actorIdentifierString(),
			/**
			 * Can be set to 'false' to skip Lexicon schema validation of record data.
			 * @default true
			 */
			validate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
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
		'blue.moji.collection.putItem': mainSchema;
	}
}
