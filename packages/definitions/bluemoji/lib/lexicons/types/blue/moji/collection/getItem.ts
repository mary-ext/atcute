import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as BlueMojiCollectionItem from './item.ts';

const _mainSchema = /*#__PURE__*/ v.query('blue.moji.collection.getItem', {
	params: /*#__PURE__*/ v.object({
		/** The Bluemoji alias/rkey. */
		name: /*#__PURE__*/ v.string(),
		/** The handle or DID of the repo. */
		repo: /*#__PURE__*/ v.actorIdentifierString(),
	}),
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

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'blue.moji.collection.getItem': mainSchema;
	}
}
