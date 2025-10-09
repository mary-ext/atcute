import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyGraphDefs from './defs.js';
import * as AppBskyRichtextFacet from '../richtext/facet.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.graph.list'),
		/**
		 * @accept image/png, image/jpeg
		 * @maxSize 1000000
		 */
		avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
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
		get labels() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([ComAtprotoLabelDefs.selfLabelsSchema]));
		},
		/**
		 * Display name for list; can not be empty.
		 * @minLength 1
		 * @maxLength 64
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 64)]),
		/**
		 * Defines the purpose of the list (aka, moderation-oriented or curration-oriented)
		 */
		get purpose() {
			return AppBskyGraphDefs.listPurposeSchema;
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.graph.list': mainSchema;
	}
}
