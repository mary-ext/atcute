import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from '../feed/defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getPostThreadV2', {
	params: /*#__PURE__*/ v.object({
		above: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
		anchor: /*#__PURE__*/ v.resourceUriString(),
		below: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 20)]),
			6,
		),
		branchingFactor: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 100)]),
			10,
		),
		prioritizeFollowedUsers: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		sort: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'newest' | 'oldest' | 'top' | (string & {})>(),
			'oldest',
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			hasHiddenReplies: /*#__PURE__*/ v.boolean(),
			get thread() {
				return /*#__PURE__*/ v.array(threadItemSchema);
			},
			get threadgate() {
				return /*#__PURE__*/ v.optional(AppBskyFeedDefs.threadgateViewSchema);
			},
		}),
	},
});
const _threadItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.unspecced.getPostThreadV2#threadItem')),
	depth: /*#__PURE__*/ v.integer(),
	uri: /*#__PURE__*/ v.resourceUriString(),
	get value() {
		return /*#__PURE__*/ v.variant([
			threadItemBlockedSchema,
			threadItemNoUnauthenticatedSchema,
			threadItemNotFoundSchema,
			threadItemPostSchema,
		]);
	},
});
const _threadItemBlockedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getPostThreadV2#threadItemBlocked'),
	),
	get author() {
		return AppBskyFeedDefs.blockedAuthorSchema;
	},
});
const _threadItemNoUnauthenticatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getPostThreadV2#threadItemNoUnauthenticated'),
	),
});
const _threadItemNotFoundSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getPostThreadV2#threadItemNotFound'),
	),
});
const _threadItemPostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getPostThreadV2#threadItemPost'),
	),
	moreParents: /*#__PURE__*/ v.boolean(),
	moreReplies: /*#__PURE__*/ v.integer(),
	opThread: /*#__PURE__*/ v.boolean(),
	get post() {
		return AppBskyFeedDefs.postViewSchema;
	},
});

type main$schematype = typeof _mainSchema;
type threadItem$schematype = typeof _threadItemSchema;
type threadItemBlocked$schematype = typeof _threadItemBlockedSchema;
type threadItemNoUnauthenticated$schematype = typeof _threadItemNoUnauthenticatedSchema;
type threadItemNotFound$schematype = typeof _threadItemNotFoundSchema;
type threadItemPost$schematype = typeof _threadItemPostSchema;

export interface mainSchema extends main$schematype {}
export interface threadItemSchema extends threadItem$schematype {}
export interface threadItemBlockedSchema extends threadItemBlocked$schematype {}
export interface threadItemNoUnauthenticatedSchema extends threadItemNoUnauthenticated$schematype {}
export interface threadItemNotFoundSchema extends threadItemNotFound$schematype {}
export interface threadItemPostSchema extends threadItemPost$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const threadItemSchema = _threadItemSchema as threadItemSchema;
export const threadItemBlockedSchema = _threadItemBlockedSchema as threadItemBlockedSchema;
export const threadItemNoUnauthenticatedSchema =
	_threadItemNoUnauthenticatedSchema as threadItemNoUnauthenticatedSchema;
export const threadItemNotFoundSchema = _threadItemNotFoundSchema as threadItemNotFoundSchema;
export const threadItemPostSchema = _threadItemPostSchema as threadItemPostSchema;

export interface ThreadItem extends v.InferInput<typeof threadItemSchema> {}
export interface ThreadItemBlocked extends v.InferInput<typeof threadItemBlockedSchema> {}
export interface ThreadItemNoUnauthenticated extends v.InferInput<typeof threadItemNoUnauthenticatedSchema> {}
export interface ThreadItemNotFound extends v.InferInput<typeof threadItemNotFoundSchema> {}
export interface ThreadItemPost extends v.InferInput<typeof threadItemPostSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getPostThreadV2': mainSchema;
	}
}
