import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.poll.definition'),
		endDate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * @maxLength 500
		 * @maxGraphemes 100
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 500),
			/*#__PURE__*/ v.stringGraphemes(0, 100),
		]),
		get options() {
			return /*#__PURE__*/ v.array(optionSchema);
		},
	}),
);
const _optionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.poll.definition#option')),
	/**
	 * @maxLength 500
	 * @maxGraphemes 50
	 */
	text: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 500),
			/*#__PURE__*/ v.stringGraphemes(0, 50),
		]),
	),
});

type main$schematype = typeof _mainSchema;
type option$schematype = typeof _optionSchema;

export interface mainSchema extends main$schematype {}
export interface optionSchema extends option$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const optionSchema = _optionSchema as optionSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Option extends v.InferInput<typeof optionSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'pub.leaflet.poll.definition': mainSchema;
	}
}
