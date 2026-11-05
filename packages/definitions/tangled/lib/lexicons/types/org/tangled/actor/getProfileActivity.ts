import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _activityMonthSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.actor.getProfileActivity#activityMonth'),
	),
	/** @minimum 0 */
	commits: /*#__PURE__*/ v.integer(),
	get issues() {
		return /*#__PURE__*/ v.array(issueActivitySchema);
	},
	get pulls() {
		return /*#__PURE__*/ v.array(pullActivitySchema);
	},
	get repos() {
		return /*#__PURE__*/ v.array(repoActivitySchema);
	},
	/** Start of this UTC calendar month. */
	start: /*#__PURE__*/ v.datetimeString(),
});
const _issueActivitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.actor.getProfileActivity#issueActivity'),
	),
	get repo() {
		return repoRefSchema;
	},
	state: /*#__PURE__*/ v.literalEnum(['closed', 'completed', 'open']),
	title: /*#__PURE__*/ v.string(),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.actor.getProfileActivity', {
	params: /*#__PURE__*/ v.object({
		/** Actor whose activity to return. */
		actor: /*#__PURE__*/ v.didString(),
		/**
		 * Number of UTC calendar months to include, including the current month.
		 *
		 * @default 7
		 * @minimum 1
		 * @maximum 12
		 */
		months: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 12)]),
			7,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get months() {
				return /*#__PURE__*/ v.array(activityMonthSchema);
			},
			/** True when the result reached the server activity-item safety limit. */
			truncated: /*#__PURE__*/ v.boolean(),
		}),
	},
});
const _pullActivitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.actor.getProfileActivity#pullActivity'),
	),
	get repo() {
		return repoRefSchema;
	},
	state: /*#__PURE__*/ v.literalEnum(['closed', 'completed', 'open']),
	title: /*#__PURE__*/ v.string(),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _repoActivitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.actor.getProfileActivity#repoActivity'),
	),
	kind: /*#__PURE__*/ v.string<'created' | 'forked' | (string & {})>(),
	get repo() {
		return repoRefSchema;
	},
});
const _repoRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.actor.getProfileActivity#repoRef')),
	did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	name: /*#__PURE__*/ v.string(),
	ownerDid: /*#__PURE__*/ v.didString(),
	ownerHandle: /*#__PURE__*/ v.handleString(),
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type activityMonth$schematype = typeof _activityMonthSchema;
type issueActivity$schematype = typeof _issueActivitySchema;
type main$schematype = typeof _mainSchema;
type pullActivity$schematype = typeof _pullActivitySchema;
type repoActivity$schematype = typeof _repoActivitySchema;
type repoRef$schematype = typeof _repoRefSchema;

export interface activityMonthSchema extends activityMonth$schematype {}
export interface issueActivitySchema extends issueActivity$schematype {}
export interface mainSchema extends main$schematype {}
export interface pullActivitySchema extends pullActivity$schematype {}
export interface repoActivitySchema extends repoActivity$schematype {}
export interface repoRefSchema extends repoRef$schematype {}

export const activityMonthSchema = _activityMonthSchema as activityMonthSchema;
export const issueActivitySchema = _issueActivitySchema as issueActivitySchema;
export const mainSchema = _mainSchema as mainSchema;
export const pullActivitySchema = _pullActivitySchema as pullActivitySchema;
export const repoActivitySchema = _repoActivitySchema as repoActivitySchema;
export const repoRefSchema = _repoRefSchema as repoRefSchema;

export interface ActivityMonth extends v.InferInput<typeof activityMonthSchema> {}
export interface IssueActivity extends v.InferInput<typeof issueActivitySchema> {}
export interface PullActivity extends v.InferInput<typeof pullActivitySchema> {}
export interface RepoActivity extends v.InferInput<typeof repoActivitySchema> {}
export interface RepoRef extends v.InferInput<typeof repoRefSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.actor.getProfileActivity': mainSchema;
	}
}
