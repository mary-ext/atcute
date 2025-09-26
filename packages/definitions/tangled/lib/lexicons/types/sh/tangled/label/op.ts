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
		subject: /*#__PURE__*/ v.resourceUriString(),
	}),
);
const _operandSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.label.op#operand')),
	key: /*#__PURE__*/ v.resourceUriString(),
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
