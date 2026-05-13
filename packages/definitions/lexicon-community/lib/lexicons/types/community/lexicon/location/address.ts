import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.location.address')),
	/**
	 * The ISO 3166 country code. Preferably the 2-letter code.
	 *
	 * @minLength 2
	 * @maxLength 10
	 */
	country: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(2, 10)]),
	/** The locality of the region. For example, a city in the USA. */
	locality: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The name of the location. */
	name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The postal code of the location. */
	postalCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The administrative region of the country. For example, a state in the USA. */
	region: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** The street address. */
	street: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
