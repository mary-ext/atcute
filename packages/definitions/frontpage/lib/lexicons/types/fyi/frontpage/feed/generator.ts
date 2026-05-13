import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('fyi.frontpage.feed.generator'),
		/** Whether the feed generator accepts interaction feedback. */
		acceptsInteractions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * Avatar image for the feed.
		 *
		 * @accept image/png, image/jpeg
		 * @maxSize 1000000
		 */
		avatar: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
				/*#__PURE__*/ v.blobSize(1000000),
				/*#__PURE__*/ v.blobAccept(['image/png', 'image/jpeg']),
			]),
		),
		/** Client-declared timestamp when this generator was created. */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * Description of the feed.
		 *
		 * @maxLength 3000
		 * @maxGraphemes 300
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 3000),
				/*#__PURE__*/ v.stringGraphemes(0, 300),
			]),
		),
		/** DID of the feed generator service. */
		did: /*#__PURE__*/ v.didString(),
		/**
		 * Display name for the feed.
		 *
		 * @maxLength 320
		 * @maxGraphemes 32
		 */
		displayName: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 320),
			/*#__PURE__*/ v.stringGraphemes(0, 32),
		]),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'fyi.frontpage.feed.generator': mainSchema;
	}
}
