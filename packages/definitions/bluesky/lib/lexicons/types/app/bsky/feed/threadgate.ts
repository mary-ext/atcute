import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _followerRuleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.threadgate#followerRule')),
});
const _followingRuleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.threadgate#followingRule')),
});
const _listRuleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.threadgate#listRule')),
	list: /*#__PURE__*/ v.resourceUriString(),
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.feed.threadgate'),
		post: /*#__PURE__*/ v.resourceUriString(),
		get allow() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(
					v.array(
						/*#__PURE__*/ v.variant([
							mentionRuleSchema,
							followerRuleSchema,
							followingRuleSchema,
							listRuleSchema,
						]),
					),
					[/*#__PURE__*/ v.arrayLength(0, 5)],
				),
			);
		},
		createdAt: /*#__PURE__*/ v.datetimeString(),
		hiddenReplies: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.resourceUriString()), [
				/*#__PURE__*/ v.arrayLength(0, 50),
			]),
		),
	}),
);
const _mentionRuleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.threadgate#mentionRule')),
});

type followerRule$schematype = typeof _followerRuleSchema;
type followingRule$schematype = typeof _followingRuleSchema;
type listRule$schematype = typeof _listRuleSchema;
type main$schematype = typeof _mainSchema;
type mentionRule$schematype = typeof _mentionRuleSchema;

export interface followerRuleSchema extends followerRule$schematype {}
export interface followingRuleSchema extends followingRule$schematype {}
export interface listRuleSchema extends listRule$schematype {}
export interface mainSchema extends main$schematype {}
export interface mentionRuleSchema extends mentionRule$schematype {}

export const followerRuleSchema = _followerRuleSchema as followerRuleSchema;
export const followingRuleSchema = _followingRuleSchema as followingRuleSchema;
export const listRuleSchema = _listRuleSchema as listRuleSchema;
export const mainSchema = _mainSchema as mainSchema;
export const mentionRuleSchema = _mentionRuleSchema as mentionRuleSchema;

export interface FollowerRule extends v.InferInput<typeof followerRuleSchema> {}
export interface FollowingRule extends v.InferInput<typeof followingRuleSchema> {}
export interface ListRule extends v.InferInput<typeof listRuleSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface MentionRule extends v.InferInput<typeof mentionRuleSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.feed.threadgate': mainSchema;
	}
}
