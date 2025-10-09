import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyRichtextFacet from '../richtext/facet.js';

const _feedItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.graph.starterpack#feedItem')),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.graph.starterpack'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * @maxLength 3000
		 * @maxGraphemes 300
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 3000),
				/*#__PURE__*/ v.stringGraphemes(0, 300),
			]),
		),
		get descriptionFacets() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyRichtextFacet.mainSchema));
		},
		/**
		 * @maxLength 3
		 */
		get feeds() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(feedItemSchema), [/*#__PURE__*/ v.arrayLength(0, 3)]),
			);
		},
		/**
		 * Reference (AT-URI) to the list record.
		 */
		list: /*#__PURE__*/ v.resourceUriString(),
		/**
		 * Display name for starter pack; can not be empty.
		 * @minLength 1
		 * @maxLength 500
		 * @maxGraphemes 50
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(1, 500),
			/*#__PURE__*/ v.stringGraphemes(0, 50),
		]),
	}),
);

type feedItem$schematype = typeof _feedItemSchema;
type main$schematype = typeof _mainSchema;

export interface feedItemSchema extends feedItem$schematype {}
export interface mainSchema extends main$schematype {}

export const feedItemSchema = _feedItemSchema as feedItemSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface FeedItem extends v.InferInput<typeof feedItemSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.graph.starterpack': mainSchema;
	}
}
