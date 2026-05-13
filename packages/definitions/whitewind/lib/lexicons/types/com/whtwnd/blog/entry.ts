import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ComWhtwndBlogDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('com.whtwnd.blog.entry'),
		get blobs() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComWhtwndBlogDefs.blobMetadataSchema));
		},
		/** @maxLength 100000 */
		content: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100000)]),
		createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * (DEPRECATED) Marks this entry as draft to tell AppViews not to show it to anyone except for the author
		 *
		 * @deprecated
		 */
		isDraft: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		get ogp() {
			return /*#__PURE__*/ v.optional(ComWhtwndBlogDefs.ogpSchema);
		},
		/** @maxLength 1000 */
		subtitle: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1000)]),
		),
		theme: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['github-light'])),
		/** @maxLength 1000 */
		title: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1000)]),
		),
		/**
		 * Tells the visibility of the article to AppView.
		 *
		 * @default 'public'
		 */
		visibility: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['author', 'public', 'url']), 'public'),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'com.whtwnd.blog.entry': mainSchema;
	}
}
