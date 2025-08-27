import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _conflictInfoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.mergeCheck#conflictInfo')),
	filename: /*#__PURE__*/ v.string(),
	reason: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.mergeCheck', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			branch: /*#__PURE__*/ v.string(),
			did: /*#__PURE__*/ v.didString(),
			name: /*#__PURE__*/ v.string(),
			patch: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get conflicts() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(conflictInfoSchema));
			},
			error: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			is_conflicted: /*#__PURE__*/ v.boolean(),
			message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});

type conflictInfo$schematype = typeof _conflictInfoSchema;
type main$schematype = typeof _mainSchema;

export interface conflictInfoSchema extends conflictInfo$schematype {}
export interface mainSchema extends main$schematype {}

export const conflictInfoSchema = _conflictInfoSchema as conflictInfoSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface ConflictInfo extends v.InferInput<typeof conflictInfoSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'sh.tangled.repo.mergeCheck': mainSchema;
	}
}
