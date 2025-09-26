import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.label.definition'),
		color: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		multiple: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(1, 40)]),
		scope: /*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()),
		get valueType() {
			return valueTypeSchema;
		},
	}),
);
const _valueTypeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.label.definition#valueType')),
	enum: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	format: /*#__PURE__*/ v.literalEnum(['any', 'did', 'nsid']),
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
