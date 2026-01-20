import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletRichtextFacet from '../richtext/facet.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.text')),
	get facets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(PubLeafletRichtextFacet.mainSchema));
	},
	plaintext: /*#__PURE__*/ v.string(),
	textSize: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['default', 'large', 'small'])),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
