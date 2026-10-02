import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.embeddedCanvas')),
	/** Alt text description of the canvas as a picture, for accessibility. */
	alt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	id: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
