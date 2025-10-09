import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyRichtextFacet from '../richtext/facet.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.feed.generator'),
		/**
		 * Declaration that a feed accepts feedback interactions from a client through app.bsky.feed.sendInteractions
		 */
		acceptsInteractions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * @accept image/png, image/jpeg
		 * @maxSize 1000000
		 */
		avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
		contentMode: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<
				'app.bsky.feed.defs#contentModeUnspecified' | 'app.bsky.feed.defs#contentModeVideo' | (string & {})
			>(),
		),
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
		did: /*#__PURE__*/ v.didString(),
		/**
		 * @maxLength 240
		 * @maxGraphemes 24
		 */
		displayName: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 240),
			/*#__PURE__*/ v.stringGraphemes(0, 24),
		]),
		/**
		 * Self-label values
		 */
		get labels() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]));
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.feed.generator': mainSchema;
	}
}
