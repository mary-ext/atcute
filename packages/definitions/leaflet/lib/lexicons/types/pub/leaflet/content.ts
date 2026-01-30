import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletPagesCanvas from './pages/canvas.js';
import * as PubLeafletPagesLinearDocument from './pages/linearDocument.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.content')),
	get pages() {
		return /*#__PURE__*/ v.array(
			/*#__PURE__*/ v.variant([PubLeafletPagesCanvas.mainSchema, PubLeafletPagesLinearDocument.mainSchema]),
		);
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
