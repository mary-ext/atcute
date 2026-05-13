import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.label.definition'),
		/** The hex value for the background color for the label. Appviews may choose to respect this. */
		color: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/** Whether this label can be repeated for a given entity, eg.: [reviewer:foo, reviewer:bar] */
		multiple: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * The display name of this label.
		 *
		 * @minGraphemes 1
		 * @maxGraphemes 40
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(1, 40)]),
		/**
		 * The areas of the repo this label may apply to, eg.: sh.tangled.repo.issue. Appviews may choose to
		 * respect this.
		 */
		scope: /*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()),
		/** The type definition of this label. Appviews may allow sorting for certain types. */
		get valueType() {
			return valueTypeSchema;
		},
	}),
);
const _valueTypeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.label.definition#valueType')),
	/** Closed set of values that this label can take. */
	enum: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	/** An optional constraint that can be applied on string concrete types. */
	format: /*#__PURE__*/ v.literalEnum(['any', 'did', 'nsid']),
	/** The concrete type of this label's value. */
	type: /*#__PURE__*/ v.literalEnum(['boolean', 'integer', 'null', 'string']),
});

type main$schematype = typeof _mainSchema;
type valueType$schematype = typeof _valueTypeSchema;

export interface mainSchema extends main$schematype {}
export interface valueTypeSchema extends valueType$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const valueTypeSchema = _valueTypeSchema as valueTypeSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface ValueType extends v.InferInput<typeof valueTypeSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.label.definition': mainSchema;
	}
}
