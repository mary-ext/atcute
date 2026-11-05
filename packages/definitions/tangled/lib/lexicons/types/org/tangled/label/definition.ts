import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.label.definition'),
		/** The hex value for the background color for the label. Appviews may choose to respect this. */
		color: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * The display name of this label.
		 *
		 * @maxLength 640
		 * @maxGraphemes 64
		 */
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 640),
			/*#__PURE__*/ v.stringGraphemes(0, 64),
		]),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.label.definition': mainSchema;
	}
}
