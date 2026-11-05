import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _onboardingPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.actor.defs#onboardingPref')),
	completedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	nudgeDismissedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	startedAt: /*#__PURE__*/ v.datetimeString(),
});
const _recentIssueSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.actor.defs#recentIssue')),
	open: /*#__PURE__*/ v.boolean(),
	/** @maxLength 253 */
	ownerHandle: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 253)]),
	/** @maxLength 100 */
	repoName: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	rkey: /*#__PURE__*/ v.recordKeyString(),
	/** @maxLength 400 */
	title: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 400)]),
	visited: /*#__PURE__*/ v.datetimeString(),
});
const _recentPullSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.actor.defs#recentPull')),
	/** @maxLength 253 */
	ownerHandle: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 253)]),
	/** @maxLength 100 */
	repoName: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	rkey: /*#__PURE__*/ v.recordKeyString(),
	state: /*#__PURE__*/ v.string<'closed' | 'completed' | 'open' | (string & {})>(),
	/** @maxLength 400 */
	title: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 400)]),
	visited: /*#__PURE__*/ v.datetimeString(),
});
const _recentRepoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.actor.defs#recentRepo')),
	/** @maxLength 100 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	ownerDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	/** @maxLength 253 */
	ownerHandle: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 253)]),
	visited: /*#__PURE__*/ v.datetimeString(),
});
const _recentsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.actor.defs#recentsPref')),
	/** @maxLength 5 */
	get items() {
		return /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([recentIssueSchema, recentPullSchema, recentRepoSchema])),
			[/*#__PURE__*/ v.arrayLength(0, 5)],
		);
	},
});
const _savedKnotPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.actor.defs#savedKnotPref')),
	get items() {
		return /*#__PURE__*/ v.array(savedServiceSchema);
	},
});
const _savedServiceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.actor.defs#savedService')),
	id: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});
const _savedSpindlePrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.actor.defs#savedSpindlePref')),
	get items() {
		return /*#__PURE__*/ v.array(savedServiceSchema);
	},
});

type onboardingPref$schematype = typeof _onboardingPrefSchema;
type recentIssue$schematype = typeof _recentIssueSchema;
type recentPull$schematype = typeof _recentPullSchema;
type recentRepo$schematype = typeof _recentRepoSchema;
type recentsPref$schematype = typeof _recentsPrefSchema;
type savedKnotPref$schematype = typeof _savedKnotPrefSchema;
type savedService$schematype = typeof _savedServiceSchema;
type savedSpindlePref$schematype = typeof _savedSpindlePrefSchema;

export interface onboardingPrefSchema extends onboardingPref$schematype {}
export interface recentIssueSchema extends recentIssue$schematype {}
export interface recentPullSchema extends recentPull$schematype {}
export interface recentRepoSchema extends recentRepo$schematype {}
export interface recentsPrefSchema extends recentsPref$schematype {}
export interface savedKnotPrefSchema extends savedKnotPref$schematype {}
export interface savedServiceSchema extends savedService$schematype {}
export interface savedSpindlePrefSchema extends savedSpindlePref$schematype {}

export const onboardingPrefSchema = _onboardingPrefSchema as onboardingPrefSchema;
export const recentIssueSchema = _recentIssueSchema as recentIssueSchema;
export const recentPullSchema = _recentPullSchema as recentPullSchema;
export const recentRepoSchema = _recentRepoSchema as recentRepoSchema;
export const recentsPrefSchema = _recentsPrefSchema as recentsPrefSchema;
export const savedKnotPrefSchema = _savedKnotPrefSchema as savedKnotPrefSchema;
export const savedServiceSchema = _savedServiceSchema as savedServiceSchema;
export const savedSpindlePrefSchema = _savedSpindlePrefSchema as savedSpindlePrefSchema;

export interface OnboardingPref extends v.InferInput<typeof onboardingPrefSchema> {}
export interface RecentIssue extends v.InferInput<typeof recentIssueSchema> {}
export interface RecentPull extends v.InferInput<typeof recentPullSchema> {}
export interface RecentRepo extends v.InferInput<typeof recentRepoSchema> {}
export interface RecentsPref extends v.InferInput<typeof recentsPrefSchema> {}
export interface SavedKnotPref extends v.InferInput<typeof savedKnotPrefSchema> {}
export interface SavedService extends v.InferInput<typeof savedServiceSchema> {}
export interface SavedSpindlePref extends v.InferInput<typeof savedSpindlePrefSchema> {}
