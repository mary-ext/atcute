import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('fyi.frontpage.feed.post'),
		/**
		 * Client-declared timestamp when this post was originally created.
		 */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * The piece of content that this Frontpage post is about.
		 */
		get subject() {
			return /*#__PURE__*/ v.variant([urlSubjectSchema]);
		},
		/**
		 * The title of the post.
		 * @maxLength 3000
		 * @maxGraphemes 300
		 */
		title: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	}),
);
const _urlSubjectSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('fyi.frontpage.feed.post#urlSubject')),
	url: /*#__PURE__*/ v.genericUriString(),
});

type main$schematype = typeof _mainSchema;
type urlSubject$schematype = typeof _urlSubjectSchema;

export interface mainSchema extends main$schematype {}
export interface urlSubjectSchema extends urlSubject$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const urlSubjectSchema = _urlSubjectSchema as urlSubjectSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface UrlSubject extends v.InferInput<typeof urlSubjectSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'fyi.frontpage.feed.post': mainSchema;
	}
}
