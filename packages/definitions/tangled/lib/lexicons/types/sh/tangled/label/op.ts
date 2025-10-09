import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.label.op'),
		get add() {
			return /*#__PURE__*/ v.array(operandSchema);
		},
		get delete() {
			return /*#__PURE__*/ v.array(operandSchema);
		},
		performedAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * The subject (task, pull or discussion) of this label. Appviews may apply a `scope` check and refuse this op.
		 */
		subject: /*#__PURE__*/ v.resourceUriString(),
	}),
);
const _operandSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.label.op#operand')),
	/**
	 * ATURI to the label definition
	 */
	key: /*#__PURE__*/ v.resourceUriString(),
	/**
	 * Stringified value of the label. This is first unstringed by appviews and then interpreted as a concrete value.
	 */
	value: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;
type operand$schematype = typeof _operandSchema;

export interface mainSchema extends main$schematype {}
export interface operandSchema extends operand$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const operandSchema = _operandSchema as operandSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Operand extends v.InferInput<typeof operandSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.label.op': mainSchema;
	}
}
