import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as BlogPcktBlockBlockquote from './block/blockquote.js';
import * as BlogPcktBlockBlueskyEmbed from './block/blueskyEmbed.js';
import * as BlogPcktBlockBulletList from './block/bulletList.js';
import * as BlogPcktBlockCodeBlock from './block/codeBlock.js';
import * as BlogPcktBlockHeading from './block/heading.js';
import * as BlogPcktBlockHorizontalRule from './block/horizontalRule.js';
import * as BlogPcktBlockImage from './block/image.js';
import * as BlogPcktBlockListItem from './block/listItem.js';
import * as BlogPcktBlockOrderedList from './block/orderedList.js';
import * as BlogPcktBlockParagraph from './block/paragraph.js';
import * as BlogPcktBlockTaskItem from './block/taskItem.js';
import * as BlogPcktBlockTaskList from './block/taskList.js';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('blog.pckt.document'),
		/**
		 * Structured content blocks composing the document body
		 */
		get blocks() {
			return /*#__PURE__*/ v.array(
				/*#__PURE__*/ v.variant([
					BlogPcktBlockBlockquote.mainSchema,
					BlogPcktBlockBlueskyEmbed.mainSchema,
					BlogPcktBlockBulletList.mainSchema,
					BlogPcktBlockCodeBlock.mainSchema,
					BlogPcktBlockHeading.mainSchema,
					BlogPcktBlockHorizontalRule.mainSchema,
					BlogPcktBlockImage.mainSchema,
					BlogPcktBlockListItem.mainSchema,
					BlogPcktBlockOrderedList.mainSchema,
					BlogPcktBlockParagraph.mainSchema,
					BlogPcktBlockTaskItem.mainSchema,
					BlogPcktBlockTaskList.mainSchema,
				]),
			);
		},
		/**
		 * Plain text representation of the document content for search and preview
		 * @maxLength 100000
		 * @maxGraphemes 50000
		 */
		bodyPlain: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 100000),
				/*#__PURE__*/ v.stringGraphemes(0, 50000),
			]),
		),
		/**
		 * Optional cover/featured image (10MB max)
		 * @accept image/*
		 * @maxSize 10000000
		 */
		cover: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
		/**
		 * Blob references for images used within the document content
		 */
		images: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.blob())),
		/**
		 * Reference to the parent publication this document belongs to
		 */
		get publication() {
			return ComAtprotoRepoStrongRef.mainSchema;
		},
		/**
		 * Timestamp when the document was first published
		 */
		publishedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * URL-friendly slug for the document (used to construct canonical URL)
		 * @maxLength 500
		 */
		slug: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 500)]),
		),
		/**
		 * Optional tags for categorization and discovery
		 * @maxLength 20
		 */
		tags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
						/*#__PURE__*/ v.stringLength(0, 100),
						/*#__PURE__*/ v.stringGraphemes(0, 50),
					]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 20)],
			),
		),
		/**
		 * Document title/headline
		 * @maxLength 1280
		 * @maxGraphemes 128
		 */
		title: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 1280),
			/*#__PURE__*/ v.stringGraphemes(0, 128),
		]),
		/**
		 * Timestamp when the document was last modified
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
		'blog.pckt.document': mainSchema;
	}
}
