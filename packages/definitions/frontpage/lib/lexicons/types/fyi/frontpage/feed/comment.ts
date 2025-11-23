import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import * as FyiFrontpageRichtextBlock from '../richtext/block.js';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('fyi.frontpage.feed.comment'),
		/**
		 * The content of the comment. Note, there are additional constraints placed on the total size of the content within the Frontpage AppView that are not possible to express in lexicon. Generally a comment can have a maximum length of 10,000 graphemes, the Frontpage AppView will enforce this limit.
		 * @maxLength 200
		 */
		get blocks() {
			return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(FyiFrontpageRichtextBlock.mainSchema), [
				/*#__PURE__*/ v.arrayLength(0, 200),
			]);
		},
		/**
		 * Client-declared timestamp when this comment was originally created.
		 */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get parent() {
			return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
		},
		get post() {
			return ComAtprotoRepoStrongRef.mainSchema;
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'fyi.frontpage.feed.comment': mainSchema;
	}
}
