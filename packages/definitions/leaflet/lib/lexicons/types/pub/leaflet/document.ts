import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as PubLeafletPagesLinearDocument from './pages/linearDocument.js';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.document'),
		author: /*#__PURE__*/ v.actorIdentifierString(),
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 3000),
				/*#__PURE__*/ v.stringGraphemes(0, 300),
			]),
		),
		get pages() {
			return /*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([PubLeafletPagesLinearDocument.mainSchema]));
		},
		publication: /*#__PURE__*/ v.resourceUriString(),
		publishedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		title: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 1280),
			/*#__PURE__*/ v.stringGraphemes(0, 128),
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
