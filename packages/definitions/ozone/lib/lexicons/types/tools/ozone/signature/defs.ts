import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _sigDetailSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.signature.defs#sigDetail')),
	property: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});

type sigDetail$schematype = typeof _sigDetailSchema;

export interface sigDetailSchema extends sigDetail$schematype {}

export const sigDetailSchema = _sigDetailSchema as sigDetailSchema;

export interface SigDetail extends v.InferInput<typeof sigDetailSchema> {}
