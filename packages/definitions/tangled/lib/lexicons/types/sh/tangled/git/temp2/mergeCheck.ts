import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _conflictSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp2.mergeCheck#conflict')),
	/** Path of the conflicted file */
	filename: /*#__PURE__*/ v.string(),
	/** Short classification of the conflict */
	reason: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp2.mergeCheck', {
	params: /*#__PURE__*/ v.object({
		/** Source commit to merge (theirs) */
		sourceCommit: /*#__PURE__*/ v.string(),
		sourceRepo: /*#__PURE__*/ v.didString(),
		/** Target branch tip to merge into (ours) */
		targetCommit: /*#__PURE__*/ v.string(),
		targetRepo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get conflicts() {
				return /*#__PURE__*/ v.array(conflictSchema);
			},
			/** Whether the merge has unresolved conflicts */
			isConflicted: /*#__PURE__*/ v.boolean(),
			/** Additional detail, e.g. unrelated histories */
			message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});

type conflict$schematype = typeof _conflictSchema;
type main$schematype = typeof _mainSchema;

export interface conflictSchema extends conflict$schematype {}
export interface mainSchema extends main$schematype {}

export const conflictSchema = _conflictSchema as conflictSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Conflict extends v.InferInput<typeof conflictSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.git.temp2.mergeCheck': mainSchema;
	}
}
