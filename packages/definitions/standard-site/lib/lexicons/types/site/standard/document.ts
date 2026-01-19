import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('site.standard.document'),
		/**
		 * Strong reference to a Bluesky post. Useful to keep track of comments off-platform.
		 */
		get bskyPostRef() {
			return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
		},
		/**
		 * Open union used to define the record's content. Each entry must specify a $type and may be extended with other lexicons to support additional content formats.
		 */
		get content() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([]));
		},
		/**
		 * Image to used for thumbnail or cover image. Less than 1MB is size.
		 * @accept image/*
		 * @maxSize 1000000
		 */
		coverImage: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
		/**
		 * A brief description or excerpt from the document.
		 * @maxLength 30000
		 * @maxGraphemes 3000
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 30000),
				/*#__PURE__*/ v.stringGraphemes(0, 3000),
			]),
		),
		/**
		 * Combine with site or publication url to construct a canonical URL to the document. Prepend with a leading slash.
		 */
		path: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Timestamp of the documents publish time.
		 */
		publishedAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * Points to a publication record (at://) or a publication url (https://) for loose documents. Avoid trailing slashes.
		 */
		site: /*#__PURE__*/ v.genericUriString(),
		/**
		 * Array of strings used to tag or categorize the document. Avoid prepending tags with hashtags.
		 */
		tags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
					/*#__PURE__*/ v.stringLength(0, 1280),
					/*#__PURE__*/ v.stringGraphemes(0, 128),
				]),
			),
		),
		/**
		 * Plaintext representation of the documents contents. Should not contain markdown or other formatting.
		 */
		textContent: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Title of the document.
		 * @maxLength 5000
		 * @maxGraphemes 500
		 */
		title: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 5000),
			/*#__PURE__*/ v.stringGraphemes(0, 500),
		]),
		/**
		 * Timestamp of the documents last edit.
		 */
		updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'site.standard.document': mainSchema;
	}
}
