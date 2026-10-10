import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletRichtextFacet from '../richtext/facet.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.interactions.question'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get facets() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(PubLeafletRichtextFacet.mainSchema));
		},
		/**
		 * @maxLength 10000
		 * @maxGraphemes 1000
		 */
		plaintext: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 10000),
			/*#__PURE__*/ v.stringGraphemes(0, 1000),
		]),
		/** The document the question is asked on. */
		subject: /*#__PURE__*/ v.resourceUriString(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'pub.leaflet.interactions.question': mainSchema;
	}
}
