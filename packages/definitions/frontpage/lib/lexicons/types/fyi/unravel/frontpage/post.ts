import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('fyi.unravel.frontpage.post'),
		/**
		 * Client-declared timestamp when this post was originally created.
		 */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * The title of the post.
		 * @maxLength 3000
		 * @maxGraphemes 300
		 */
		title: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
		/**
		 * The URL of the post.
		 */
		url: /*#__PURE__*/ v.genericUriString(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'fyi.unravel.frontpage.post': mainSchema;
	}
}
