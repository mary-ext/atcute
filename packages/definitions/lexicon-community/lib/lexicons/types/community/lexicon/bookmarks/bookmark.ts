import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('community.lexicon.bookmarks.bookmark'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		subject: /*#__PURE__*/ v.genericUriString(),
		/** Tags for content the bookmark may be related to, for example 'news' or 'funny videos' */
		tags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'community.lexicon.bookmarks.bookmark': mainSchema;
	}
}
