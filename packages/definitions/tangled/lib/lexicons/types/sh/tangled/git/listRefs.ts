import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _defaultBranchSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.listRefs#defaultBranch')),
	/**
	 * Commit SHA at the tip of the default branch, for reconciling against a last-known state. Width depends on
	 * the repo's git object-format.
	 *
	 * @minLength 40
	 * @maxLength 128
	 */
	head: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 128)]),
	),
	/**
	 * Default branch ref name that HEAD points at, eg. refs/heads/main.
	 *
	 * @maxLength 2560
	 * @maxGraphemes 256
	 */
	ref: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 2560),
		/*#__PURE__*/ v.stringGraphemes(0, 256),
	]),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.listRefs', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Maximum number of refs to return in this page
		 *
		 * @default 100
		 * @minimum 1
		 * @maximum 1000
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			100,
		),
		/** DID of the git repo as minted by the knot */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Cursor for the next page, absent when the last page is reached */
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get defaultBranch() {
				return /*#__PURE__*/ v.optional(defaultBranchSchema);
			},
			/** @maxLength 1000 */
			get refs() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(refSchema), [
					/*#__PURE__*/ v.arrayLength(0, 1000),
				]);
			},
		}),
	},
});
const _refSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.listRefs#ref')),
	/**
	 * Full ref name, eg. refs/heads/main or refs/tags/v1.0
	 *
	 * @maxLength 2560
	 * @maxGraphemes 256
	 */
	ref: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 2560),
		/*#__PURE__*/ v.stringGraphemes(0, 256),
	]),
	/**
	 * Object SHA the ref points at. Width depends on the repo's git object-format.
	 *
	 * @minLength 40
	 * @maxLength 128
	 */
	sha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 128)]),
});

type defaultBranch$schematype = typeof _defaultBranchSchema;
type main$schematype = typeof _mainSchema;
type ref$schematype = typeof _refSchema;

export interface defaultBranchSchema extends defaultBranch$schematype {}
export interface mainSchema extends main$schematype {}
export interface refSchema extends ref$schematype {}

export const defaultBranchSchema = _defaultBranchSchema as defaultBranchSchema;
export const mainSchema = _mainSchema as mainSchema;
export const refSchema = _refSchema as refSchema;

export interface DefaultBranch extends v.InferInput<typeof defaultBranchSchema> {}
export interface Ref extends v.InferInput<typeof refSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.git.listRefs': mainSchema;
	}
}
