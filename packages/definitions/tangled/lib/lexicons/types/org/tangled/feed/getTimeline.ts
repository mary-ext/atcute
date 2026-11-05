import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledActorDefs from '../actor/defs.ts';
import * as OrgTangledRepoDefs from '../repo/defs.ts';

const _followEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.feed.getTimeline#followEvent')),
	get actor() {
		return OrgTangledActorDefs.profileViewBasicSchema;
	},
	cid: /*#__PURE__*/ v.cidString(),
	get subject() {
		return OrgTangledActorDefs.profileViewDetailedSchema;
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.feed.getTimeline', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		followingOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** TODO: deprecate this and use auth instead. */
		viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get feed() {
				return /*#__PURE__*/ v.array(timelineItemSchema);
			},
		}),
	},
});
const _repoEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.feed.getTimeline#repoEvent')),
	cid: /*#__PURE__*/ v.cidString(),
	get repo() {
		return OrgTangledRepoDefs.repoViewBasicSchema;
	},
	/** Fork parent, present only if this repo is a fork. */
	get source() {
		return /*#__PURE__*/ v.optional(OrgTangledRepoDefs.repoViewBasicSchema);
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _starEventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.feed.getTimeline#starEvent')),
	/** Who starred. */
	get actor() {
		return OrgTangledActorDefs.profileViewBasicSchema;
	},
	cid: /*#__PURE__*/ v.cidString(),
	/** The starred repo. */
	get repo() {
		return OrgTangledRepoDefs.repoViewBasicSchema;
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _timelineItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.feed.getTimeline#timelineItem')),
	get event() {
		return /*#__PURE__*/ v.variant([followEventSchema, repoEventSchema, starEventSchema]);
	},
	eventAt: /*#__PURE__*/ v.datetimeString(),
});

type followEvent$schematype = typeof _followEventSchema;
type main$schematype = typeof _mainSchema;
type repoEvent$schematype = typeof _repoEventSchema;
type starEvent$schematype = typeof _starEventSchema;
type timelineItem$schematype = typeof _timelineItemSchema;

export interface followEventSchema extends followEvent$schematype {}
export interface mainSchema extends main$schematype {}
export interface repoEventSchema extends repoEvent$schematype {}
export interface starEventSchema extends starEvent$schematype {}
export interface timelineItemSchema extends timelineItem$schematype {}

export const followEventSchema = _followEventSchema as followEventSchema;
export const mainSchema = _mainSchema as mainSchema;
export const repoEventSchema = _repoEventSchema as repoEventSchema;
export const starEventSchema = _starEventSchema as starEventSchema;
export const timelineItemSchema = _timelineItemSchema as timelineItemSchema;

export interface FollowEvent extends v.InferInput<typeof followEventSchema> {}
export interface RepoEvent extends v.InferInput<typeof repoEventSchema> {}
export interface StarEvent extends v.InferInput<typeof starEventSchema> {}
export interface TimelineItem extends v.InferInput<typeof timelineItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.feed.getTimeline': mainSchema;
	}
}
