import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComWhtwndBlogDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('com.whtwnd.blog.entry'),
		get blobs() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComWhtwndBlogDefs.blobMetadataSchema));
		},
		content: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100000)]),
		createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		isDraft: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		get ogp() {
			return /*#__PURE__*/ v.optional(ComWhtwndBlogDefs.ogpSchema);
		},
		subtitle: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1000)]),
		),
		theme: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['github-light'])),
		title: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1000)]),
		),
		visibility: /*#__PURE__*/ v.literalEnum(['author', 'public', 'url']),
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
