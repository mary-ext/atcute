import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.interactions.reply'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/** The reply: a document in the same repo as this record. */
		document: /*#__PURE__*/ v.resourceUriString(),
		/** The document being replied to. */
		subject: /*#__PURE__*/ v.resourceUriString(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'pub.leaflet.interactions.reply': mainSchema;
	}
}
