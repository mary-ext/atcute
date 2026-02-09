import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as BlogPcktBlockImage from './block/image.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('blog.pckt.gallery'),
		/**
		 * Optional caption for the entire gallery
		 * @maxLength 3000
		 * @maxGraphemes 300
		 */
		caption: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 3000),
				/*#__PURE__*/ v.stringGraphemes(0, 300),
			]),
		),
		/**
		 * Array of image blocks in display order
		 * @minLength 1
		 * @maxLength 50
		 */
		get images() {
			return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(BlogPcktBlockImage.imageAttrsSchema), [
				/*#__PURE__*/ v.arrayLength(1, 50),
			]);
		},
		/**
		 * Layout style for rendering the gallery (e.g. grid, carousel, masonry, list)
		 * @maxLength 50
		 */
		layout: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 50)]),
		),
		/**
		 * Optional title for the gallery
		 * @maxLength 200
		 */
		title: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 200)]),
		),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'blog.pckt.gallery': mainSchema;
	}
}
