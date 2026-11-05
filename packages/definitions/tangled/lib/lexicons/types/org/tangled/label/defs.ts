import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _labelTokenSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.label.defs#labelToken')),
	/** Record-key of org.tangled.label.definition owned by this repository. */
	key: /*#__PURE__*/ v.recordKeyString(),
});

type labelToken$schematype = typeof _labelTokenSchema;

export interface labelTokenSchema extends labelToken$schematype {}

export const labelTokenSchema = _labelTokenSchema as labelTokenSchema;

export interface LabelToken extends v.InferInput<typeof labelTokenSchema> {}
