import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.ci.describeWorkflowDefinition', {
	params: /*#__PURE__*/ v.object({
		/** Target repository DID the workflow definition belongs to. */
		repo: /*#__PURE__*/ v.didString(),
		/**
		 * Commit SHA to resolve the workflow definition at
		 *
		 * @minLength 40
		 * @maxLength 40
		 */
		sha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 40)]),
		/** Repository DID to resolve workflow definitions from, if different from the target repo */
		sourceRepo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Whether the workflow definition is derived from this repository at all. When false, no
			 * commit-to-commit comparison is meaningful (e.g. definitions managed externally), and callers should
			 * not surface change warnings.
			 */
			derived: /*#__PURE__*/ v.boolean(),
			/** Fingerprint of the workflow definition as resolved by the spindle. Absent when derived is false. */
			hash: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Names or paths of the effective workflow files that produced the hash. */
			workflows: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.ci.describeWorkflowDefinition': mainSchema;
	}
}
