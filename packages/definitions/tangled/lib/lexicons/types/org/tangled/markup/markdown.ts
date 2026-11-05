import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledMarkupEmbedImage from './embed/image.ts';
import * as OrgTangledMarkupEmbedVideo from './embed/video.ts';

const _inlineSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.markup.markdown#inline')),
	/**
	 * Final post-processed markdown content that will be rendered
	 *
	 * @maxLength 1024
	 * @maxGraphemes 256
	 */
	text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 1024),
		/*#__PURE__*/ v.stringGraphemes(0, 256),
	]),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.markup.markdown')),
	/** list of blobs referenced in markdown */
	get blobs() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.variant([
					OrgTangledMarkupEmbedImage.mainSchema,
					OrgTangledMarkupEmbedVideo.mainSchema,
				]),
			),
		);
	},
	/**
	 * Final post-processed markdown content that will be rendered
	 *
	 * @maxLength 262144
	 * @maxGraphemes 65536
	 */
	text: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 262144),
		/*#__PURE__*/ v.stringGraphemes(0, 65536),
	]),
});

type inline$schematype = typeof _inlineSchema;
type main$schematype = typeof _mainSchema;

export interface inlineSchema extends inline$schematype {}
export interface mainSchema extends main$schematype {}

export const inlineSchema = _inlineSchema as inlineSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Inline extends v.InferInput<typeof inlineSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
