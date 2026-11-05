import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('com.atproto.label.record'),
		/** Optionally, CID specifying the specific version of 'uri' resource this label applies to. */
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		/** Timestamp when this label was created. */
		cts: /*#__PURE__*/ v.datetimeString(),
		/** Timestamp at which this label expires (no longer applies). */
		exp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * URI of the record, repository (account), or other resource that this label applies to. Currently only
		 * intended for use in the context of atproto spaces.
		 */
		uri: /*#__PURE__*/ v.genericUriString(),
		/**
		 * The short string name of the value or type of this label.
		 *
		 * @maxLength 128
		 */
		val: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 128)]),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'com.atproto.label.record': mainSchema;
	}
}
