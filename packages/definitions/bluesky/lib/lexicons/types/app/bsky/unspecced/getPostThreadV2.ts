import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyFeedDefs from '../feed/defs.js';
import * as AppBskyUnspeccedDefs from './defs.js';

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
			AppBskyUnspeccedDefs.threadItemBlockedSchema,
			AppBskyUnspeccedDefs.threadItemNoUnauthenticatedSchema,
			AppBskyUnspeccedDefs.threadItemNotFoundSchema,
			AppBskyUnspeccedDefs.threadItemPostSchema,
		]);
	},
});

type main$schematype = typeof _mainSchema;
type threadItem$schematype = typeof _threadItemSchema;

export interface mainSchema extends main$schematype {}
export interface threadItemSchema extends threadItem$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const threadItemSchema = _threadItemSchema as threadItemSchema;

export interface ThreadItem extends v.InferInput<typeof threadItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getPostThreadV2': mainSchema;
	}
}
