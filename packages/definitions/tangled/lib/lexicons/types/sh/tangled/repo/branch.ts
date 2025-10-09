import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.branch', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Branch name to get information for
		 */
		name: /*#__PURE__*/ v.string(),
		/**
		 * Repository identifier in format 'did:plc:.../repoName'
		 */
		repo: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get author() {
				return /*#__PURE__*/ v.optional(signatureSchema);
			},
			/**
			 * Latest commit hash on this branch
			 */
			hash: /*#__PURE__*/ v.string(),
			/**
			 * Whether this is the default branch
			 */
			isDefault: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/**
			 * Latest commit message
			 */
			message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Branch name
			 */
			name: /*#__PURE__*/ v.string(),
			/**
			 * Short commit hash
			 */
			shortHash: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Timestamp of latest commit
			 */
			when: /*#__PURE__*/ v.datetimeString(),
		}),
	},
});
const _signatureSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.branch#signature')),
	/**
	 * Author email
	 */
	email: /*#__PURE__*/ v.string(),
	/**
	 * Author name
	 */
	name: /*#__PURE__*/ v.string(),
	/**
	 * Author timestamp
	 */
	when: /*#__PURE__*/ v.datetimeString(),
});

type main$schematype = typeof _mainSchema;
type signature$schematype = typeof _signatureSchema;

export interface mainSchema extends main$schematype {}
export interface signatureSchema extends signature$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const signatureSchema = _signatureSchema as signatureSchema;

export interface Signature extends v.InferInput<typeof signatureSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.repo.branch': mainSchema;
	}
}
