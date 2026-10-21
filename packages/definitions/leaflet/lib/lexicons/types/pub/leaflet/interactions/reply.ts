import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.interactions.reply'),
		/**
		 * The key of the pub.leaflet.blocks.reply block on the subject this was submitted through, when the
		 * subject has more than one.
		 *
		 * @maxLength 100
		 */
		block: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
		),
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
