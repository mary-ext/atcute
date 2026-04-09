import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletPagesCanvas from './pages/canvas.ts';
import * as PubLeafletPagesLinearDocument from './pages/linearDocument.ts';
import * as PubLeafletPublication from './publication.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.document'),
		author: /*#__PURE__*/ v.actorIdentifierString(),
		/**
		 * @accept image/png, image/jpeg, image/webp
		 * @maxSize 1000000
		 */
		coverImage: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
				/*#__PURE__*/ v.blobSize(1000000),
				/*#__PURE__*/ v.blobAccept(['image/png', 'image/jpeg', 'image/webp']),
			]),
		),
		/**
		 * @maxLength 30000
		 * @maxGraphemes 3000
		 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 30000),
				/*#__PURE__*/ v.stringGraphemes(0, 3000),
			]),
		),
		get pages() {
			return /*#__PURE__*/ v.array(
				/*#__PURE__*/ v.variant([PubLeafletPagesCanvas.mainSchema, PubLeafletPagesLinearDocument.mainSchema]),
			);
		},
		get postRef() {
			return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
		},
		get preferences() {
			return /*#__PURE__*/ v.optional(PubLeafletPublication.preferencesSchema);
		},
		publication: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		publishedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		tags: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 50)]),
			),
		),
		get theme() {
			return /*#__PURE__*/ v.optional(PubLeafletPublication.themeSchema);
		},
		/**
		 * @maxLength 5000
		 * @maxGraphemes 500
		 */
		title: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 5000),
			/*#__PURE__*/ v.stringGraphemes(0, 500),
		]),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'pub.leaflet.document': mainSchema;
	}
}
