import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletContent from './content.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.publicationPage'),
		get content() {
			return PubLeafletContent.mainSchema;
		},
		path: /*#__PURE__*/ v.string(),
		publication: /*#__PURE__*/ v.resourceUriString(),
		publishedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/** @maxLength 2000 */
		title: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 2000)]),
		),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'pub.leaflet.publicationPage': mainSchema;
	}
}
