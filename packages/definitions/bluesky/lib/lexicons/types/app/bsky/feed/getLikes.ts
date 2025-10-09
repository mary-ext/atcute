import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from '../actor/defs.js';

const _likeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.getLikes#like')),
	get actor() {
		return AppBskyActorDefs.profileViewSchema;
	},
	createdAt: /*#__PURE__*/ v.datetimeString(),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
});
const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.getLikes', {
	params: /*#__PURE__*/ v.object({
		/**
		 * CID of the subject record (aka, specific version of record), to filter likes.
		 */
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * AT-URI of the subject (eg, a post record).
		 */
		uri: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get likes() {
				return /*#__PURE__*/ v.array(likeSchema);
			},
			uri: /*#__PURE__*/ v.resourceUriString(),
		}),
	},
});

type like$schematype = typeof _likeSchema;
type main$schematype = typeof _mainSchema;

export interface likeSchema extends like$schematype {}
export interface mainSchema extends main$schematype {}

export const likeSchema = _likeSchema as likeSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Like extends v.InferInput<typeof likeSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.feed.getLikes': mainSchema;
	}
}
