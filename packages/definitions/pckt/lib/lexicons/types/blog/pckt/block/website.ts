import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.website')),
	/** A brief description of the website or page */
	description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** URL of the preview image */
	previewImage: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	/** The URL of the website */
	src: /*#__PURE__*/ v.genericUriString(),
	/** The title of the website or page */
	title: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
