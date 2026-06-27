import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _defaultBranchSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.sync.listRepos#defaultBranch')),
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
	 * Default branch ref name, eg. refs/heads/main.
	 *
	 * @maxLength 2560
	 * @maxGraphemes 256
	 */
	ref: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 2560),
		/*#__PURE__*/ v.stringGraphemes(0, 256),
	]),
});
const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.sync.listRepos', {
	params: /*#__PURE__*/ v.object({
		/** Pagination cursor */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 1000
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			50,
		),
		/**
		 * Sort direction over the service's repo listing order.
		 *
		 * @default 'desc'
		 */
		order: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'asc' | 'desc' | (string & {})>(), 'desc'),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** @maxLength 1000 */
			get repos() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(repoSchema), [
					/*#__PURE__*/ v.arrayLength(0, 1000),
				]);
			},
		}),
	},
});
const _repoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.sync.listRepos#repo')),
	get defaultBranch() {
		return /*#__PURE__*/ v.optional(defaultBranchSchema);
	},
	/** DID of the git repo as minted by the knot */
	repo: /*#__PURE__*/ v.didString(),
	/** Serving status of the repo according to the knot. */
	status: /*#__PURE__*/ v.string<'active' | 'archived' | 'disabled' | (string & {})>(),
});

type defaultBranch$schematype = typeof _defaultBranchSchema;
type main$schematype = typeof _mainSchema;
type repo$schematype = typeof _repoSchema;

export interface defaultBranchSchema extends defaultBranch$schematype {}
export interface mainSchema extends main$schematype {}
export interface repoSchema extends repo$schematype {}

export const defaultBranchSchema = _defaultBranchSchema as defaultBranchSchema;
export const mainSchema = _mainSchema as mainSchema;
export const repoSchema = _repoSchema as repoSchema;

export interface DefaultBranch extends v.InferInput<typeof defaultBranchSchema> {}
export interface Repo extends v.InferInput<typeof repoSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.sync.listRepos': mainSchema;
	}
}
